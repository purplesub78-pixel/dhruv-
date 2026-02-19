import os
import uuid
import httpx
from datetime import datetime, timezone, timedelta
from fastapi import Request, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional

# Database connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Emergent Auth Session Data URL
EMERGENT_AUTH_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"

async def exchange_session_id(session_id: str) -> dict:
    """
    Exchange session_id for user data and session_token from Emergent Auth.
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                EMERGENT_AUTH_URL,
                headers={"X-Session-ID": session_id},
                timeout=10.0
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=401, detail=f"Failed to exchange session_id: {str(e)}")

async def create_or_update_user(email: str, name: str, picture: str = None, role: str = "client") -> str:
    """
    Create new user or update existing user.
    Returns user_id.
    """
    # Check if user exists
    existing_user = await db.users.find_one({"email": email}, {"_id": 0})
    
    if existing_user:
        # Update user info if needed
        await db.users.update_one(
            {"email": email},
            {"$set": {
                "name": name,
                "picture": picture,
                "updated_at": datetime.now(timezone.utc)
            }}
        )
        return existing_user["user_id"]
    else:
        # Create new user
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "role": role,
            "created_at": datetime.now(timezone.utc)
        })
        return user_id

async def store_session(user_id: str, session_token: str) -> None:
    """
    Store session_token in database with 7-day expiry.
    """
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc)
    })

async def verify_session_token(session_token: str) -> Optional[dict]:
    """
    Verify session_token and return user data if valid.
    Returns None if invalid or expired.
    """
    # Find session
    session_doc = await db.user_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    
    if not session_doc:
        return None
    
    # Check expiry
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        # Session expired - delete it
        await db.user_sessions.delete_one({"session_token": session_token})
        return None
    
    # Get user data
    user_doc = await db.users.find_one(
        {"user_id": session_doc["user_id"]},
        {"_id": 0}
    )
    
    if not user_doc:
        return None
    
    return user_doc

async def get_current_user(request: Request) -> dict:
    """
    Get current authenticated user from session_token.
    Checks cookie first, then Authorization header.
    REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    """
    session_token = None
    
    # Check cookie first
    session_token = request.cookies.get("session_token")
    
    # Fallback to Authorization header
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.replace("Bearer ", "")
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user = await verify_session_token(session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    
    return user

async def delete_session(session_token: str) -> None:
    """
    Delete session from database (logout).
    """
    await db.user_sessions.delete_one({"session_token": session_token})

async def require_role(user: dict, required_roles: list):
    """
    Check if user has required role.
    Raises HTTPException if not authorized.
    """
    if user["role"] not in required_roles:
        raise HTTPException(
            status_code=403,
            detail=f"Access denied. Required roles: {required_roles}"
        )
