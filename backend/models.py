from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional, List
from datetime import datetime
import uuid
import re

# ========== BUILDING MODELS ==========
class BuildingCreate(BaseModel):
    name: str
    address: str
    city: str
    state: str
    plan: str
    maxSuites: int
    documentRequired: bool = True
    selfieRequired: bool = False
    defaultLanguage: str = 'pt'
    adminEmail: EmailStr

class Building(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    address: str
    city: str
    state: str
    plan: str
    maxSuites: int
    currentSuites: int = 0
    status: str = 'active'
    documentRequired: bool = True
    selfieRequired: bool = False
    defaultLanguage: str = 'pt'
    monthlyRevenue: float = 0
    adminEmail: EmailStr
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

# ========== COMPANY MODELS ==========
class CompanyCreate(BaseModel):
    name: str
    suite: str
    buildingId: str

class Company(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    buildingId: str
    name: str
    suite: str
    status: str = 'active'
    receptionists: List[str] = []
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

# ========== USER MODELS ==========
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=3)
    role: str
    buildingId: Optional[str] = None
    companyId: Optional[str] = None

    @validator('role')
    def validate_role(cls, v):
        valid_roles = ['super_admin', 'building_admin', 'front_desk', 'company_receptionist']
        if v not in valid_roles:
            raise ValueError(f'Role must be one of {valid_roles}')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    role: str
    buildingId: Optional[str] = None
    companyId: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class UserInDB(User):
    password: str

# ========== VISITOR MODELS ==========
class VisitorCreate(BaseModel):
    fullName: str = Field(min_length=3)
    hostName: str
    companyId: str
    buildingId: str
    representingCompany: Optional[str] = ''
    reason: Optional[str] = ''
    companions: int = 0
    document: Optional[str] = ''
    documentImage: Optional[str] = None
    selfie: Optional[str] = None
    language: str = 'pt'

class Visitor(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    buildingId: str
    companyId: str
    fullName: str
    hostName: str
    representingCompany: str = ''
    reason: str = ''
    companions: int = 0
    document: str = ''
    documentImage: Optional[str] = None
    selfie: Optional[str] = None
    status: str = 'pending'  # pending, approved, denied, checked_out
    checkInTime: Optional[datetime] = None
    checkOutTime: Optional[datetime] = None
    notes: str = ''
    language: str = 'pt'
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

# ========== PLAN MODELS ==========
class PlanUpdate(BaseModel):
    name: Optional[str] = None
    minSuites: Optional[int] = None
    maxSuites: Optional[int] = None
    monthlyPrice: Optional[float] = None
    active: Optional[bool] = None
    description: Optional[str] = None

class Plan(BaseModel):
    id: str
    name: str
    minSuites: int
    maxSuites: int
    monthlyPrice: float
    active: bool = True
    description: str

# ========== SETTINGS MODELS ==========
class SystemSettings(BaseModel):
    supportEmail: EmailStr
    brandName: str = 'AcessaAqui'
    brandSlogan: str = 'Acesso rápido, seguro e digital. Aqui.'
    lgpdText: str
    emailTemplates: dict
