from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uuid

# User Role Enum
class UserRole(str, Enum):
    CLIENT = "client"
    ADMIN = "admin"
    TALENT = "talent"  # Models and Influencers

# User Models
class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    role: UserRole = UserRole.CLIENT
    phone: Optional[str] = None
    company: Optional[str] = None
    created_at: datetime

class UserSession(BaseModel):
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime

# Project Models
class ProjectStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    REVIEW = "review"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class ProjectCreate(BaseModel):
    services: List[str]
    goal: str
    platform: str
    timeline: str
    budget: str
    details: str
    name: str
    email: str
    phone: Optional[str] = None

class Project(BaseModel):
    project_id: str
    client_id: str
    client_name: str
    client_email: str
    client_phone: Optional[str] = None
    services: List[str]
    goal: str
    platform: str
    timeline: str
    budget: str
    details: str
    status: ProjectStatus = ProjectStatus.PENDING
    created_at: datetime
    updated_at: datetime
    assigned_talents: List[str] = []  # List of user_ids

# Payment Models
class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

class PaymentCreate(BaseModel):
    project_id: str
    amount: float
    payment_method: str = "paypal"  # paypal, stripe, etc

class Payment(BaseModel):
    payment_id: str
    project_id: str
    client_id: str
    amount: float
    payment_method: str
    status: PaymentStatus = PaymentStatus.PENDING
    transaction_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

# Deliverable Models
class DeliverableType(str, Enum):
    DRAFT = "draft"
    FINAL = "final"
    REVISION = "revision"

class Deliverable(BaseModel):
    deliverable_id: str
    project_id: str
    title: str
    description: Optional[str] = None
    file_url: str
    file_type: str  # video, image, document
    deliverable_type: DeliverableType
    uploaded_by: str  # user_id
    uploaded_at: datetime
    approved: bool = False

# Project Update Models
class ProjectUpdate(BaseModel):
    update_id: str
    project_id: str
    message: str
    created_by: str  # user_id
    created_at: datetime

# Feedback Models
class Feedback(BaseModel):
    feedback_id: str
    project_id: str
    deliverable_id: Optional[str] = None
    message: str
    created_by: str  # user_id
    created_at: datetime
