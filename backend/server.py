from fastapi import FastAPI, APIRouter, Request, HTTPException, Response
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from datetime import datetime, timezone
from typing import List
import uuid
import razorpay

# Import models and auth helpers
from models import (
    User, UserSession, Project, ProjectCreate, ProjectStatus,
    Payment, PaymentCreate, PaymentStatus,
    Deliverable, ProjectUpdate, Feedback, UserRole,
    StatusCheck, StatusCheckCreate
)
import auth
from auth import (
    exchange_session_id, create_or_update_user, store_session,
    verify_session_token, get_current_user, delete_session, require_role
)


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Set database for auth module
auth.set_database(db)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Razorpay Client
razorpay_client = None
try:
    razorpay_key_id = os.environ.get('RAZORPAY_KEY_ID', '')
    razorpay_key_secret = os.environ.get('RAZORPAY_KEY_SECRET', '')
    if razorpay_key_id and razorpay_key_secret and not razorpay_key_id.startswith('your_'):
        razorpay_client = razorpay.Client(auth=(razorpay_key_id, razorpay_key_secret))
        logger.info("Razorpay client initialized successfully")
    else:
        logger.warning("Razorpay credentials not configured - using mock payments")
except Exception as e:
    logger.error(f"Failed to initialize Razorpay client: {str(e)}")
    razorpay_client = None

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============================================================================
# HEALTH CHECK ENDPOINT (Required for deployment)
# ============================================================================
@api_router.get("/health")
async def health_check():
    """Health check endpoint for deployment verification"""
    return {"status": "healthy", "service": "purple-aster-backend"}

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    


# ============================================================================
# AUTHENTICATION ENDPOINTS
# ============================================================================

@api_router.post("/auth/session")
async def create_session(request: Request, response: Response):
    """
    Exchange session_id from Emergent Auth for session_token.
    REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    """
    try:
        body = await request.json()
        session_id = body.get("session_id")
        role = body.get("role", "client")  # Default role is client
        
        if not session_id:
            raise HTTPException(status_code=400, detail="session_id is required")
        
        # Exchange session_id for user data
        auth_data = await exchange_session_id(session_id)
        
        # Create or update user
        user_id = await create_or_update_user(
            email=auth_data["email"],
            name=auth_data["name"],
            picture=auth_data.get("picture"),
            role=role
        )
        
        # Store session
        session_token = auth_data["session_token"]
        await store_session(user_id, session_token)
        
        # Set httpOnly cookie
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite="lax",
            path="/",
            max_age=7 * 24 * 60 * 60  # 7 days
        )
        
        # Get user data
        user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
        
        return {
            "success": True,
            "user": user
        }
        
    except Exception as e:
        logger.error(f"Session creation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/auth/me")
async def get_me(request: Request):
    """
    Get current authenticated user.
    """
    user = await get_current_user(request)
    return user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    """
    Logout user and delete session.
    """
    session_token = request.cookies.get("session_token")
    if session_token:
        await delete_session(session_token)
    
    response.delete_cookie(key="session_token", path="/")
    return {"success": True, "message": "Logged out successfully"}

# ============================================================================
# PROJECT ENDPOINTS
# ============================================================================

@api_router.post("/projects")
async def create_project(project_data: ProjectCreate, request: Request):
    """
    Create a new project (client onboarding).
    """
    try:
        user = await get_current_user(request)
        
        project_id = f"proj_{uuid.uuid4().hex[:12]}"
        project = {
            "project_id": project_id,
            "client_id": user["user_id"],
            "client_name": project_data.name,
            "client_email": project_data.email,
            "client_phone": project_data.phone,
            "services": project_data.services,
            "goal": project_data.goal,
            "platform": project_data.platform,
            "timeline": project_data.timeline,
            "budget": project_data.budget,
            "details": project_data.details,
            "status": ProjectStatus.PENDING.value,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
            "assigned_talents": []
        }
        
        await db.projects.insert_one(project)
        
        # Log project creation
        logger.info(f"Project created: {project_id} by {user['email']}")
        
        # Remove MongoDB's _id field before returning
        project_response = {k: v for k, v in project.items() if k != '_id'}
        
        return {"success": True, "project_id": project_id, "project": project_response}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Project creation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/projects")
async def get_projects(request: Request):
    """
    Get projects based on user role.
    - Clients see only their projects
    - Admin/Talents see all projects
    """
    try:
        user = await get_current_user(request)
        
        if user["role"] == UserRole.CLIENT.value:
            # Clients see only their projects
            projects = await db.projects.find(
                {"client_id": user["user_id"]},
                {"_id": 0}
            ).to_list(100)
        else:
            # Admin and talents see all projects
            projects = await db.projects.find({}, {"_id": 0}).to_list(100)
        
        return {"success": True, "projects": projects}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch projects: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/projects/{project_id}")
async def get_project(project_id: str, request: Request):
    """
    Get project details by ID.
    """
    try:
        user = await get_current_user(request)
        
        project = await db.projects.find_one(
            {"project_id": project_id},
            {"_id": 0}
        )
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Check access permission
        if user["role"] == UserRole.CLIENT.value and project["client_id"] != user["user_id"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        return {"success": True, "project": project}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch project: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.patch("/projects/{project_id}/status")
async def update_project_status(project_id: str, request: Request):
    """
    Update project status (Admin only).
    """
    try:
        user = await get_current_user(request)
        await require_role(user, [UserRole.ADMIN.value])
        
        body = await request.json()
        new_status = body.get("status")
        
        if new_status not in [s.value for s in ProjectStatus]:
            raise HTTPException(status_code=400, detail="Invalid status")
        
        result = await db.projects.update_one(
            {"project_id": project_id},
            {"$set": {
                "status": new_status,
                "updated_at": datetime.now(timezone.utc)
            }}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Project not found")
        
        return {"success": True, "message": "Status updated"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Status update failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# PAYMENT ENDPOINTS (MOCKED FOR NOW)
# ============================================================================

@api_router.post("/payments")
async def create_payment(payment_data: PaymentCreate, request: Request):
    """
    Create a payment record (MOCKED - add real PayPal integration later).
    """
    try:
        user = await get_current_user(request)
        
        # Verify project exists and belongs to user
        project = await db.projects.find_one(
            {"project_id": payment_data.project_id},
            {"_id": 0}
        )
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        if project["client_id"] != user["user_id"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        payment_id = f"pay_{uuid.uuid4().hex[:12]}"
        payment = {
            "payment_id": payment_id,
            "project_id": payment_data.project_id,
            "client_id": user["user_id"],
            "amount": payment_data.amount,
            "payment_method": payment_data.payment_method,
            "status": PaymentStatus.PENDING.value,
            "transaction_id": None,  # Will be set by payment gateway
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        
        await db.payments.insert_one(payment)
        
        # TODO: Integrate with PayPal API here
        # For now, auto-complete the payment
        await db.payments.update_one(
            {"payment_id": payment_id},
            {"$set": {
                "status": PaymentStatus.COMPLETED.value,
                "transaction_id": f"mock_txn_{uuid.uuid4().hex[:8]}",
                "updated_at": datetime.now(timezone.utc)
            }}
        )
        
        logger.info(f"Payment created (MOCKED): {payment_id} for project {payment_data.project_id}")
        
        return {
            "success": True,
            "payment_id": payment_id,
            "status": "completed",
            "message": "Payment processed successfully (MOCKED)"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Payment creation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/payments/{project_id}")
async def get_payments(project_id: str, request: Request):
    """
    Get payments for a project.
    """
    try:
        user = await get_current_user(request)
        
        # Verify access
        project = await db.projects.find_one(
            {"project_id": project_id},
            {"_id": 0}
        )
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        if user["role"] == UserRole.CLIENT.value and project["client_id"] != user["user_id"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        payments = await db.payments.find(
            {"project_id": project_id},
            {"_id": 0}
        ).to_list(100)
        
        return {"success": True, "payments": payments}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch payments: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# DELIVERABLES ENDPOINTS
# ============================================================================

@api_router.post("/deliverables")
async def upload_deliverable(request: Request):
    """
    Upload a deliverable (Admin/Talent only).
    File upload is MOCKED - add real file storage later.
    """
    try:
        user = await get_current_user(request)
        await require_role(user, [UserRole.ADMIN.value, UserRole.TALENT.value])
        
        body = await request.json()
        
        deliverable_id = f"deliv_{uuid.uuid4().hex[:12]}"
        deliverable = {
            "deliverable_id": deliverable_id,
            "project_id": body["project_id"],
            "title": body["title"],
            "description": body.get("description"),
            "file_url": body["file_url"],  # MOCKED - should be actual cloud storage URL
            "file_type": body["file_type"],
            "deliverable_type": body["deliverable_type"],
            "uploaded_by": user["user_id"],
            "uploaded_at": datetime.now(timezone.utc),
            "approved": False
        }
        
        await db.deliverables.insert_one(deliverable)
        
        logger.info(f"Deliverable uploaded: {deliverable_id} for project {body['project_id']}")
        
        return {"success": True, "deliverable_id": deliverable_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Deliverable upload failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/deliverables/{project_id}")
async def get_deliverables(project_id: str, request: Request):
    """
    Get deliverables for a project.
    """
    try:
        user = await get_current_user(request)
        
        # Verify access
        project = await db.projects.find_one(
            {"project_id": project_id},
            {"_id": 0}
        )
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        if user["role"] == UserRole.CLIENT.value and project["client_id"] != user["user_id"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        deliverables = await db.deliverables.find(
            {"project_id": project_id},
            {"_id": 0}
        ).to_list(100)
        
        return {"success": True, "deliverables": deliverables}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch deliverables: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# PROJECT UPDATES ENDPOINTS
# ============================================================================

@api_router.post("/updates")
async def create_update(request: Request):
    """
    Create a project update (Admin/Talent only).
    """
    try:
        user = await get_current_user(request)
        await require_role(user, [UserRole.ADMIN.value, UserRole.TALENT.value])
        
        body = await request.json()
        
        update_id = f"upd_{uuid.uuid4().hex[:12]}"
        update = {
            "update_id": update_id,
            "project_id": body["project_id"],
            "message": body["message"],
            "created_by": user["user_id"],
            "created_at": datetime.now(timezone.utc)
        }
        
        await db.project_updates.insert_one(update)
        
        return {"success": True, "update_id": update_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update creation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/updates/{project_id}")
async def get_updates(project_id: str, request: Request):
    """
    Get updates for a project.
    """
    try:
        user = await get_current_user(request)
        
        # Verify access
        project = await db.projects.find_one(
            {"project_id": project_id},
            {"_id": 0}
        )
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        if user["role"] == UserRole.CLIENT.value and project["client_id"] != user["user_id"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        updates = await db.project_updates.find(
            {"project_id": project_id},
            {"_id": 0}
        ).sort("created_at", -1).to_list(100)
        
        return {"success": True, "updates": updates}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch updates: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# ADMIN DASHBOARD ENDPOINTS
# ============================================================================

@api_router.get("/admin/stats")
async def get_admin_stats(request: Request):
    """
    Get dashboard statistics (Admin only).
    """
    try:
        user = await get_current_user(request)
        await require_role(user, [UserRole.ADMIN.value])
        
        # Count statistics
        total_projects = await db.projects.count_documents({})
        active_projects = await db.projects.count_documents({"status": ProjectStatus.IN_PROGRESS.value})
        total_clients = await db.users.count_documents({"role": UserRole.CLIENT.value})
        total_revenue = await db.payments.aggregate([
            {"$match": {"status": PaymentStatus.COMPLETED.value}},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]).to_list(1)
        
        revenue = total_revenue[0]["total"] if total_revenue else 0
        
        return {
            "success": True,
            "stats": {
                "total_projects": total_projects,
                "active_projects": active_projects,
                "total_clients": total_clients,
                "total_revenue": revenue
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch admin stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/admin/users")
async def get_all_users(request: Request):
    """
    Get all users (Admin only).
    """
    try:
        user = await get_current_user(request)
        await require_role(user, [UserRole.ADMIN.value])
        
        users = await db.users.find({}, {"_id": 0}).to_list(500)
        
        return {"success": True, "users": users}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch users: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# Include the router in the main app
app.include_router(api_router)

# CORS Configuration
# For production with credentials, we need to handle origins specially
cors_origins_env = os.environ.get('CORS_ORIGINS', '*')

# If wildcard is specified, convert it to allow any origin by using regex pattern
# This allows credentials to work correctly
if cors_origins_env == '*':
    # Allow all origins with credentials by using regex pattern
    from starlette.middleware.cors import ALL_METHODS
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex='.*',  # Matches any origin
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    # Use specific origins
    cors_origins = [origin.strip() for origin in cors_origins_env.split(',')]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()