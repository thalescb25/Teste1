from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional, List
from datetime import datetime
import uuid
import re

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=3)
    building: str
    role: str = Field(default="receptionist")

    @validator('role')
    def validate_role(cls, v):
        if v not in ['admin', 'receptionist']:
            raise ValueError('Role must be admin or receptionist')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    role: str
    building: str
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class UserInDB(User):
    password: str

class VisitorCreate(BaseModel):
    name: str = Field(min_length=3)
    document: str
    company: str
    host: str

    @validator('document')
    def validate_document(cls, v):
        # Remove non-numeric characters
        doc = re.sub(r'\D', '', v)
        if len(doc) != 11:
            raise ValueError('Document must be a valid CPF (11 digits)')
        return v

class Visitor(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    document: str
    company: str
    host: str
    checkInTime: datetime = Field(default_factory=datetime.utcnow)
    checkOutTime: Optional[datetime] = None
    status: str = Field(default="checked-in")
    qrCode: str = Field(default_factory=lambda: f"QR{str(uuid.uuid4())[:8].upper()}")
    userId: str
    building: str
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class NewsletterSubscribe(BaseModel):
    email: EmailStr

class Newsletter(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    subscribedAt: datetime = Field(default_factory=datetime.utcnow)

class Stats(BaseModel):
    todayVisitors: int
    activeVisitors: int
    totalVisitorsMonth: int
    averageStayTime: str
