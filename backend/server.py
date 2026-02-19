from fastapi import FastAPI, APIRouter, Request, HTTPException, Response, Query
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
import cloudinary
import cloudinary.utils
import time
import asyncio
import resend

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

# Cloudinary Configuration
try:
    cloudinary.config(
        cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME"),
        api_key=os.environ.get("CLOUDINARY_API_KEY"),
        api_secret=os.environ.get("CLOUDINARY_API_SECRET"),
        secure=True
    )
    logger.info("Cloudinary configured successfully")
except Exception as e:
    logger.error(f"Failed to configure Cloudinary: {str(e)}")

# Resend Email Configuration
resend_api_key = os.environ.get("RESEND_API_KEY")
if resend_api_key:
    resend.api_key = resend_api_key
    logger.info("Resend email service configured successfully")
else:
    logger.warning("Resend API key not configured - email notifications disabled")

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
            "reference_files": project_data.reference_files if hasattr(project_data, 'reference_files') else [],
            "status": ProjectStatus.PENDING.value,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
            "assigned_talents": []
        }
        
        await db.projects.insert_one(project)
        
        # Log project creation
        logger.info(f"Project created: {project_id} by {user['email']}")
        
        # Send confirmation email (non-blocking)
        asyncio.create_task(send_email_notification(
            to_email=project_data.email,
            subject="Project Received - Purple Aster Studio",
            html_content=get_project_confirmation_email(project)
        ))
        
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
# PAYMENT ENDPOINTS (RAZORPAY INTEGRATION)
# ============================================================================

@api_router.post("/payments/create-order")
async def create_payment_order(request: Request):
    """
    Create Razorpay order for payment.
    """
    try:
        user = await get_current_user(request)
        body = await request.json()
        
        project_id = body.get('project_id')
        amount = body.get('amount')  # Amount in rupees
        
        # Verify project exists and belongs to user
        project = await db.projects.find_one(
            {"project_id": project_id},
            {"_id": 0}
        )
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        if project["client_id"] != user["user_id"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Create payment record
        payment_id = f"pay_{uuid.uuid4().hex[:12]}"
        
        if razorpay_client:
            # Create Razorpay order
            razorpay_order = razorpay_client.order.create({
                "amount": int(amount * 100),  # Convert to paise
                "currency": "INR",
                "payment_capture": 1,
                "notes": {
                    "project_id": project_id,
                    "payment_id": payment_id,
                    "client_id": user["user_id"]
                }
            })
            
            # Store payment with Razorpay order ID
            payment = {
                "payment_id": payment_id,
                "project_id": project_id,
                "client_id": user["user_id"],
                "amount": amount,
                "payment_method": "razorpay",
                "status": PaymentStatus.PENDING.value,
                "razorpay_order_id": razorpay_order["id"],
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }
            
            await db.payments.insert_one(payment)
            
            logger.info(f"Razorpay order created: {razorpay_order['id']} for payment {payment_id}")
            
            return {
                "success": True,
                "payment_id": payment_id,
                "razorpay_order_id": razorpay_order["id"],
                "razorpay_key_id": os.environ.get('RAZORPAY_KEY_ID'),
                "amount": razorpay_order["amount"],
                "currency": razorpay_order["currency"]
            }
        else:
            # Mock payment (no Razorpay configured)
            payment = {
                "payment_id": payment_id,
                "project_id": project_id,
                "client_id": user["user_id"],
                "amount": amount,
                "payment_method": "mock",
                "status": PaymentStatus.COMPLETED.value,
                "transaction_id": f"mock_txn_{uuid.uuid4().hex[:8]}",
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }
            
            await db.payments.insert_one(payment)
            
            logger.info(f"Mock payment created: {payment_id} for project {project_id}")
            
            return {
                "success": True,
                "payment_id": payment_id,
                "status": "completed",
                "message": "Payment processed successfully (MOCKED - Add Razorpay keys to use real payments)"
            }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Payment order creation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/payments/verify")
async def verify_payment(request: Request):
    """
    Verify Razorpay payment signature and update payment status.
    """
    try:
        user = await get_current_user(request)
        body = await request.json()
        
        razorpay_order_id = body.get('razorpay_order_id')
        razorpay_payment_id = body.get('razorpay_payment_id')
        razorpay_signature = body.get('razorpay_signature')
        payment_id = body.get('payment_id')
        
        # Find payment record
        payment = await db.payments.find_one(
            {"payment_id": payment_id},
            {"_id": 0}
        )
        
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")
        
        if payment["client_id"] != user["user_id"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Get project for email
        project = await db.projects.find_one(
            {"project_id": payment["project_id"]},
            {"_id": 0}
        )
        
        if razorpay_client:
            # Verify signature
            try:
                razorpay_client.utility.verify_payment_signature({
                    'razorpay_order_id': razorpay_order_id,
                    'razorpay_payment_id': razorpay_payment_id,
                    'razorpay_signature': razorpay_signature
                })
                
                # Update payment status
                await db.payments.update_one(
                    {"payment_id": payment_id},
                    {"$set": {
                        "status": PaymentStatus.COMPLETED.value,
                        "razorpay_payment_id": razorpay_payment_id,
                        "transaction_id": razorpay_payment_id,
                        "updated_at": datetime.now(timezone.utc)
                    }}
                )
                
                logger.info(f"Payment verified successfully: {payment_id}")
                
                # Send payment confirmation email
                if project:
                    payment["transaction_id"] = razorpay_payment_id
                    asyncio.create_task(send_email_notification(
                        to_email=project.get("client_email", user["email"]),
                        subject="Payment Confirmed - Purple Aster Studio",
                        html_content=get_payment_confirmation_email(payment, project)
                    ))
                
                return {
                    "success": True,
                    "message": "Payment verified successfully",
                    "payment_id": payment_id,
                    "status": "completed"
                }
                
            except razorpay.errors.SignatureVerificationError:
                # Update payment as failed
                await db.payments.update_one(
                    {"payment_id": payment_id},
                    {"$set": {
                        "status": PaymentStatus.FAILED.value,
                        "updated_at": datetime.now(timezone.utc)
                    }}
                )
                raise HTTPException(status_code=400, detail="Payment verification failed")
        else:
            # Mock payment verification
            await db.payments.update_one(
                {"payment_id": payment_id},
                {"$set": {
                    "status": PaymentStatus.COMPLETED.value,
                    "transaction_id": f"mock_txn_{uuid.uuid4().hex[:8]}",
                    "updated_at": datetime.now(timezone.utc)
                }}
            )
            
            # Send payment confirmation email (even for mock)
            if project:
                payment["transaction_id"] = f"mock_txn_{uuid.uuid4().hex[:8]}"
                asyncio.create_task(send_email_notification(
                    to_email=project.get("client_email", user["email"]),
                    subject="Payment Confirmed - Purple Aster Studio",
                    html_content=get_payment_confirmation_email(payment, project)
                ))
            
            return {
                "success": True,
                "message": "Payment verified successfully (MOCKED)",
                "payment_id": payment_id,
                "status": "completed"
            }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Payment verification failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/payments")
async def create_payment(payment_data: PaymentCreate, request: Request):
    """
    Legacy endpoint - redirects to create_payment_order.
    Kept for backward compatibility.
    """
    user = await get_current_user(request)
    
    # Create order using new endpoint
    return await create_payment_order(request)

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

# ============================================================================
# CLOUDINARY FILE UPLOAD ENDPOINTS
# ============================================================================

@api_router.get("/cloudinary/signature")
async def generate_cloudinary_signature(
    request: Request,
    resource_type: str = Query("image", enum=["image", "video"]),
    folder: str = Query("uploads")
):
    """
    Generate a signed upload signature for Cloudinary.
    The frontend uses this to upload directly to Cloudinary.
    """
    try:
        user = await get_current_user(request)
        
        # Validate folder path (allow user-specific and project folders)
        allowed_prefixes = ("uploads/", "projects/", "users/", "references/")
        if not folder.startswith(allowed_prefixes):
            folder = f"uploads/{folder}"
        
        timestamp = int(time.time())
        params = {
            "timestamp": timestamp,
            "folder": folder,
            "resource_type": resource_type
        }
        
        signature = cloudinary.utils.api_sign_request(
            params,
            os.environ.get("CLOUDINARY_API_SECRET")
        )
        
        logger.info(f"Generated Cloudinary signature for user {user['email']}, folder: {folder}")
        
        return {
            "signature": signature,
            "timestamp": timestamp,
            "cloud_name": os.environ.get("CLOUDINARY_CLOUD_NAME"),
            "api_key": os.environ.get("CLOUDINARY_API_KEY"),
            "folder": folder,
            "resource_type": resource_type
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to generate Cloudinary signature: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# EMAIL NOTIFICATION FUNCTIONS
# ============================================================================

async def send_email_notification(to_email: str, subject: str, html_content: str):
    """
    Send email notification using Resend.
    Non-blocking async function.
    """
    if not resend_api_key:
        logger.warning(f"Email not sent (no API key): {subject} to {to_email}")
        return None
    
    try:
        params = {
            "from": "Purple Aster Studio <onboarding@resend.dev>",
            "to": [to_email],
            "subject": subject,
            "html": html_content
        }
        
        # Run sync SDK in thread to keep FastAPI non-blocking
        email = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Email sent successfully to {to_email}: {subject}")
        return email
        
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return None

def get_project_confirmation_email(project_data: dict) -> str:
    """Generate HTML email for project confirmation."""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #7C3AED, #6D28D9); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
            .highlight {{ background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #7C3AED; }}
            .footer {{ text-align: center; padding: 20px; color: #666; font-size: 14px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Purple Aster Studio</h1>
                <p>Your Project Has Been Received!</p>
            </div>
            <div class="content">
                <p>Hello {project_data.get('client_name', 'Valued Client')},</p>
                <p>Thank you for submitting your project with Purple Aster Studio. We're excited to bring your vision to life!</p>
                
                <div class="highlight">
                    <h3>Project Details:</h3>
                    <p><strong>Services:</strong> {', '.join(project_data.get('services', []))}</p>
                    <p><strong>Goal:</strong> {project_data.get('goal', 'N/A')}</p>
                    <p><strong>Platform:</strong> {project_data.get('platform', 'N/A')}</p>
                    <p><strong>Timeline:</strong> {project_data.get('timeline', 'N/A')}</p>
                    <p><strong>Budget:</strong> {project_data.get('budget', 'N/A')}</p>
                </div>
                
                <p>Our team will review your project and get back to you within 24-48 hours.</p>
                <p>If you have any questions, feel free to reply to this email.</p>
                
                <p>Best regards,<br><strong>Purple Aster Studio Team</strong></p>
            </div>
            <div class="footer">
                <p>&copy; 2025 Purple Aster Studio. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """

def get_payment_confirmation_email(payment_data: dict, project_data: dict) -> str:
    """Generate HTML email for payment confirmation."""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
            .highlight {{ background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #10B981; }}
            .amount {{ font-size: 32px; color: #10B981; font-weight: bold; }}
            .footer {{ text-align: center; padding: 20px; color: #666; font-size: 14px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Payment Confirmed!</h1>
                <p>Thank you for your payment</p>
            </div>
            <div class="content">
                <p>Hello {project_data.get('client_name', 'Valued Client')},</p>
                <p>We have successfully received your payment. Here are the details:</p>
                
                <div class="highlight">
                    <h3>Payment Details:</h3>
                    <p class="amount">₹{payment_data.get('amount', 0):,.2f}</p>
                    <p><strong>Payment ID:</strong> {payment_data.get('payment_id', 'N/A')}</p>
                    <p><strong>Transaction ID:</strong> {payment_data.get('transaction_id', 'N/A')}</p>
                    <p><strong>Project:</strong> {', '.join(project_data.get('services', []))}</p>
                    <p><strong>Date:</strong> {datetime.now(timezone.utc).strftime('%B %d, %Y at %I:%M %p UTC')}</p>
                </div>
                
                <p>Your project is now active and our team will begin working on it shortly.</p>
                <p>You can track your project progress in your dashboard.</p>
                
                <p>Best regards,<br><strong>Purple Aster Studio Team</strong></p>
            </div>
            <div class="footer">
                <p>&copy; 2025 Purple Aster Studio. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """

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