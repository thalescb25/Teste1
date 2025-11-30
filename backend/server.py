from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext
import secrets

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', secrets.token_urlsafe(32))
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Twilio (sandbox para MVP)
TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID', 'demo_sid')
TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN', 'demo_token')
TWILIO_WHATSAPP_NUMBER = os.environ.get('TWILIO_WHATSAPP_NUMBER', 'whatsapp:+14155238886')

# Create the main app without a prefix
app = FastAPI(title="ChegouAqui API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

class BuildingCreate(BaseModel):
    name: str
    address: str
    admin_name: str
    admin_email: EmailStr
    admin_password: str
    num_apartments: int
    plan: str = "basic"  # basic, standard, premium

class Building(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    address: Optional[str] = None
    registration_code: str
    num_apartments: int
    plan: str
    message_quota: int
    max_apartments: int
    messages_used: int
    active: bool
    custom_message: Optional[str] = None
    created_at: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str  # super_admin, building_admin, doorman
    building_id: Optional[str] = None

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    role: str
    building_id: Optional[str] = None
    active: bool

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: User

class ApartmentCreate(BaseModel):
    number: str
    building_id: str

class Apartment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    number: str
    building_id: str
    created_at: str

class ResidentPhoneCreate(BaseModel):
    apartment_id: str
    whatsapp: str
    name: Optional[str] = None

class ResidentPhone(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    apartment_id: str
    whatsapp: str
    name: Optional[str] = None
    created_at: str

class PublicRegistrationRequest(BaseModel):
    registration_code: str
    apartment_number: str
    whatsapp: str
    name: Optional[str] = None

class DeliveryCreate(BaseModel):
    apartment_id: str

class Delivery(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    apartment_id: str
    apartment_number: str
    building_id: str
    doorman_id: str
    doorman_name: str
    timestamp: str
    status: str  # success, failed
    phones_notified: List[str]

class WhatsAppLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    delivery_id: str
    phone: str
    status: str
    error_message: Optional[str] = None
    timestamp: str

class UsageStats(BaseModel):
    building_id: str
    month: str
    messages_sent: int

class BuildingUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    plan: Optional[str] = None
    num_apartments: Optional[int] = None
    active: Optional[bool] = None
    custom_message: Optional[str] = None

# ==================== HELPER FUNCTIONS ====================

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token inválido")
        
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="Usuário não encontrado")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

def generate_registration_code() -> str:
    return secrets.token_urlsafe(8).upper()

# Planos e suas características
PLANS = {
    "basic": {
        "name": "Basic",
        "message_quota": 500,
        "max_apartments": 50,
        "price": 49.00,
        "unlimited_messages": False
    },
    "standard": {
        "name": "Standard",
        "message_quota": 1500,
        "max_apartments": 100,
        "price": 99.00,
        "unlimited_messages": False
    },
    "premium": {
        "name": "Premium",
        "message_quota": 999999,  # Ilimitado
        "max_apartments": 999999,  # Ilimitado (300+)
        "price": 199.00,
        "unlimited_messages": True
    }
}

PLAN_QUOTAS = {k: v["message_quota"] for k, v in PLANS.items()}

async def send_whatsapp_message(phone: str, message: str) -> tuple[bool, Optional[str]]:
    """
    Simula envio de WhatsApp via Twilio (sandbox para MVP)
    Retorna (success, error_message)
    """
    try:
        # Em produção, usar Twilio API:
        # from twilio.rest import Client
        # client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        # message = client.messages.create(
        #     from_=TWILIO_WHATSAPP_NUMBER,
        #     body=message,
        #     to=f'whatsapp:{phone}'
        # )
        
        # Para MVP: simular sucesso
        logging.info(f"[WHATSAPP SIMULADO] Para: {phone} | Mensagem: {message}")
        return (True, None)
    except Exception as e:
        logging.error(f"Erro ao enviar WhatsApp: {str(e)}")
        return (False, str(e))

# ==================== STARTUP ====================

@app.on_event("startup")
async def startup_event():
    # Criar super admin se não existir
    super_admin = await db.users.find_one({"role": "super_admin"})
    if not super_admin:
        super_admin_data = {
            "id": str(uuid.uuid4()),
            "email": "admin@chegouaqui.com",
            "password": hash_password("admin123"),
            "name": "Super Admin",
            "role": "super_admin",
            "building_id": None,
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(super_admin_data)
        logging.info("Super Admin criado: admin@chegouaqui.com / admin123")

# ==================== AUTH ENDPOINTS ====================

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    user = await db.users.find_one({"email": request.email}, {"_id": 0})
    if not user or not verify_password(request.password, user["password"]):
        raise HTTPException(status_code=401, detail="Email ou senha incorretos")
    
    if not user.get("active", True):
        raise HTTPException(status_code=401, detail="Usuário inativo")
    
    access_token = create_access_token({"sub": user["id"]})
    refresh_token = create_refresh_token({"sub": user["id"]})
    
    user_data = User(**user)
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=user_data
    )

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: dict = Depends(get_current_user)):
    return User(**current_user)

# ==================== SUPER ADMIN ENDPOINTS ====================

@api_router.post("/super-admin/buildings", response_model=Building)
async def create_building(building: BuildingCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "super_admin":
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    # Validar limites do plano
    plan_info = PLANS.get(building.plan)
    if not plan_info:
        raise HTTPException(status_code=400, detail="Plano inválido")
    
    if building.num_apartments > plan_info["max_apartments"]:
        raise HTTPException(
            status_code=400, 
            detail=f"Número de apartamentos excede o limite do plano {plan_info['name']} ({plan_info['max_apartments']} apts)"
        )
    
    # Criar prédio
    building_id = str(uuid.uuid4())
    registration_code = generate_registration_code()
    
    building_data = {
        "id": building_id,
        "name": building.name,
        "address": building.address,
        "registration_code": registration_code,
        "num_apartments": building.num_apartments,
        "plan": building.plan,
        "message_quota": plan_info["message_quota"],
        "max_apartments": plan_info["max_apartments"],
        "messages_used": 0,
        "active": True,
        "custom_message": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.buildings.insert_one(building_data)
    
    # Criar admin do prédio
    admin_id = str(uuid.uuid4())
    admin_data = {
        "id": admin_id,
        "email": building.admin_email,
        "password": hash_password(building.admin_password),
        "name": building.admin_name,
        "role": "building_admin",
        "building_id": building_id,
        "active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(admin_data)
    
    # Criar apartamentos
    for i in range(1, building.num_apartments + 1):
        apt_data = {
            "id": str(uuid.uuid4()),
            "number": str(i),
            "building_id": building_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.apartments.insert_one(apt_data)
    
    return Building(**building_data)

@api_router.get("/super-admin/buildings", response_model=List[Building])
async def get_all_buildings(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "super_admin":
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    buildings = await db.buildings.find({}, {"_id": 0}).to_list(1000)
    return [Building(**b) for b in buildings]

@api_router.put("/super-admin/buildings/{building_id}", response_model=Building)
async def update_building(building_id: str, update: BuildingUpdate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "super_admin":
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    # Buscar prédio atual
    current_building = await db.buildings.find_one({"id": building_id}, {"_id": 0})
    if not current_building:
        raise HTTPException(status_code=404, detail="Prédio não encontrado")
    
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    
    # Atualizar quotas se plano mudou
    if "plan" in update_data:
        plan_info = PLANS.get(update_data["plan"])
        if not plan_info:
            raise HTTPException(status_code=400, detail="Plano inválido")
        update_data["message_quota"] = plan_info["message_quota"]
        update_data["max_apartments"] = plan_info["max_apartments"]
        
        # Validar se num_apartments atual não excede novo limite
        num_apts = update_data.get("num_apartments", current_building.get("num_apartments", 0))
        if num_apts > plan_info["max_apartments"]:
            raise HTTPException(
                status_code=400,
                detail=f"Número de apartamentos ({num_apts}) excede o limite do plano {plan_info['name']} ({plan_info['max_apartments']} apts)"
            )
    
    # Validar mudança de num_apartments
    if "num_apartments" in update_data:
        plan = update_data.get("plan", current_building.get("plan"))
        plan_info = PLANS.get(plan)
        if update_data["num_apartments"] > plan_info["max_apartments"]:
            raise HTTPException(
                status_code=400,
                detail=f"Número de apartamentos excede o limite do plano {plan_info['name']} ({plan_info['max_apartments']} apts)"
            )
        
        # Se aumentando apartamentos, criar novos
        current_apts = current_building.get("num_apartments", 0)
        if update_data["num_apartments"] > current_apts:
            for i in range(current_apts + 1, update_data["num_apartments"] + 1):
                apt_data = {
                    "id": str(uuid.uuid4()),
                    "number": str(i),
                    "building_id": building_id,
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                await db.apartments.insert_one(apt_data)
    
    await db.buildings.update_one({"id": building_id}, {"$set": update_data})
    
    building = await db.buildings.find_one({"id": building_id}, {"_id": 0})
    return Building(**building)

@api_router.delete("/super-admin/buildings/{building_id}")
async def delete_building(building_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "super_admin":
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    # Deletar todos os dados relacionados ao prédio
    await db.buildings.delete_one({"id": building_id})
    await db.users.delete_many({"building_id": building_id})
    
    # Buscar todos os apartamentos do prédio
    apartments = await db.apartments.find({"building_id": building_id}, {"_id": 0}).to_list(1000)
    apartment_ids = [apt["id"] for apt in apartments]
    
    # Deletar telefones dos apartamentos
    if apartment_ids:
        await db.resident_phones.delete_many({"apartment_id": {"$in": apartment_ids}})
    
    # Deletar apartamentos
    await db.apartments.delete_many({"building_id": building_id})
    
    # Deletar entregas e logs
    deliveries = await db.deliveries.find({"building_id": building_id}, {"_id": 0}).to_list(1000)
    delivery_ids = [d["id"] for d in deliveries]
    
    if delivery_ids:
        await db.whatsapp_logs.delete_many({"delivery_id": {"$in": delivery_ids}})
    
    await db.deliveries.delete_many({"building_id": building_id})
    
    return {"message": "Prédio deletado com sucesso"}

@api_router.get("/super-admin/stats")
async def get_global_stats(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "super_admin":
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    total_buildings = await db.buildings.count_documents({})
    total_deliveries = await db.deliveries.count_documents({})
    active_buildings = await db.buildings.count_documents({"active": True})
    
    # Mensagens hoje
    today = datetime.now(timezone.utc).date().isoformat()
    today_deliveries = await db.deliveries.count_documents({
        "timestamp": {"$regex": f"^{today}"}
    })
    
    return {
        "total_buildings": total_buildings,
        "active_buildings": active_buildings,
        "total_deliveries": total_deliveries,
        "today_deliveries": today_deliveries
    }

# ==================== BUILDING ADMIN ENDPOINTS ====================

@api_router.get("/admin/building", response_model=Building)
async def get_my_building(current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["building_admin", "doorman"]:
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    building = await db.buildings.find_one({"id": current_user["building_id"]}, {"_id": 0})
    if not building:
        raise HTTPException(status_code=404, detail="Prédio não encontrado")
    
    return Building(**building)

@api_router.put("/admin/building/message")
async def update_custom_message(message: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "building_admin":
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    await db.buildings.update_one(
        {"id": current_user["building_id"]},
        {"$set": {"custom_message": message}}
    )
    
    return {"message": "Mensagem atualizada com sucesso"}

@api_router.put("/admin/building/address")
async def update_building_address(address: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "building_admin":
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    await db.buildings.update_one(
        {"id": current_user["building_id"]},
        {"$set": {"address": address}}
    )
    
    return {"message": "Endereço atualizado com sucesso"}

@api_router.post("/admin/users", response_model=User)
async def create_doorman(user: UserCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "building_admin":
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    # Verificar se email já existe
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    user_id = str(uuid.uuid4())
    user_data = {
        "id": user_id,
        "email": user.email,
        "password": hash_password(user.password),
        "name": user.name,
        "role": user.role,
        "building_id": current_user["building_id"],
        "active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_data)
    
    return User(**user_data)

@api_router.get("/admin/users", response_model=List[User])
async def get_building_users(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "building_admin":
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    users = await db.users.find(
        {"building_id": current_user["building_id"], "role": {"$ne": "super_admin"}},
        {"_id": 0}
    ).to_list(1000)
    
    return [User(**u) for u in users]

@api_router.get("/admin/apartments", response_model=List[Apartment])
async def get_apartments(current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["building_admin", "doorman"]:
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    apartments = await db.apartments.find(
        {"building_id": current_user["building_id"]},
        {"_id": 0}
    ).to_list(1000)
    
    # Ordenar por número
    apartments.sort(key=lambda x: int(x["number"]) if x["number"].isdigit() else 0)
    
    return [Apartment(**a) for a in apartments]

@api_router.get("/admin/apartments-with-phones")
async def get_apartments_with_phones(current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["building_admin", "doorman"]:
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    apartments = await db.apartments.find(
        {"building_id": current_user["building_id"]},
        {"_id": 0}
    ).to_list(1000)
    
    # Buscar telefones para cada apartamento
    apartments_with_phones = []
    for apt in apartments:
        phones = await db.resident_phones.find(
            {"apartment_id": apt["id"]},
            {"_id": 0}
        ).to_list(100)
        
        apartments_with_phones.append({
            **apt,
            "phones": phones
        })
    
    # Ordenar por número
    apartments_with_phones.sort(key=lambda x: int(x["number"]) if x["number"].isdigit() else 0)
    
    return apartments_with_phones

@api_router.post("/admin/apartments/{apartment_id}/phones", response_model=ResidentPhone)
async def add_resident_phone(apartment_id: str, phone: ResidentPhoneCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "building_admin":
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    # Verificar se apartamento pertence ao prédio
    apartment = await db.apartments.find_one({"id": apartment_id, "building_id": current_user["building_id"]})
    if not apartment:
        raise HTTPException(status_code=404, detail="Apartamento não encontrado")
    
    phone_id = str(uuid.uuid4())
    phone_data = {
        "id": phone_id,
        "apartment_id": apartment_id,
        "whatsapp": phone.whatsapp,
        "name": phone.name,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.resident_phones.insert_one(phone_data)
    
    return ResidentPhone(**phone_data)

@api_router.get("/admin/apartments/{apartment_id}/phones", response_model=List[ResidentPhone])
async def get_apartment_phones(apartment_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["building_admin", "doorman"]:
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    phones = await db.resident_phones.find({"apartment_id": apartment_id}, {"_id": 0}).to_list(1000)
    return [ResidentPhone(**p) for p in phones]

@api_router.delete("/admin/phones/{phone_id}")
async def delete_resident_phone(phone_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "building_admin":
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    result = await db.resident_phones.delete_one({"id": phone_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Telefone não encontrado")
    
    return {"message": "Telefone removido com sucesso"}

@api_router.get("/admin/deliveries", response_model=List[Delivery])
async def get_building_deliveries(
    current_user: dict = Depends(get_current_user),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    apartment_number: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 1000
):
    if current_user["role"] != "building_admin":
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    # Construir filtro
    query = {"building_id": current_user["building_id"]}
    
    # Filtro de data
    if start_date or end_date:
        date_filter = {}
        if start_date:
            date_filter["$gte"] = start_date
        if end_date:
            # Adicionar um dia ao end_date para incluir todo o dia
            from datetime import datetime, timedelta, timezone
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            end_dt = end_dt + timedelta(days=1)
            date_filter["$lt"] = end_dt.isoformat()
        query["timestamp"] = date_filter
    
    # Filtro de apartamento
    if apartment_number:
        query["apartment_number"] = apartment_number
    
    # Filtro de status
    if status:
        query["status"] = status
    
    deliveries = await db.deliveries.find(
        query,
        {"_id": 0}
    ).sort("timestamp", -1).to_list(limit)
    
    return [Delivery(**d) for d in deliveries]

@api_router.get("/admin/deliveries/stats")
async def get_delivery_stats(
    current_user: dict = Depends(get_current_user),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    if current_user["role"] != "building_admin":
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    # Construir filtro
    query = {"building_id": current_user["building_id"]}
    
    if start_date or end_date:
        date_filter = {}
        if start_date:
            date_filter["$gte"] = start_date
        if end_date:
            from datetime import datetime, timedelta, timezone
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            end_dt = end_dt + timedelta(days=1)
            date_filter["$lt"] = end_dt.isoformat()
        query["timestamp"] = date_filter
    
    # Estatísticas
    deliveries = await db.deliveries.find(query, {"_id": 0}).to_list(10000)
    
    total = len(deliveries)
    success = len([d for d in deliveries if d.get("status") == "success"])
    failed = len([d for d in deliveries if d.get("status") == "failed"])
    
    # Apartamentos mais ativos
    apt_counts = {}
    for d in deliveries:
        apt_num = d.get("apartment_number")
        apt_counts[apt_num] = apt_counts.get(apt_num, 0) + 1
    
    top_apartments = sorted(apt_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    
    # Total de telefones notificados
    total_phones = sum(len(d.get("phones_notified", [])) for d in deliveries)
    
    return {
        "total_deliveries": total,
        "successful": success,
        "failed": failed,
        "total_phones_notified": total_phones,
        "top_apartments": [{"number": apt, "count": count} for apt, count in top_apartments]
    }

# ==================== PLANS MANAGEMENT ====================

@api_router.get("/super-admin/plans")
async def get_plans(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "super_admin":
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    return PLANS

@api_router.get("/super-admin/financial-dashboard")
async def get_financial_dashboard(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "super_admin":
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    # Buscar todos os prédios ativos
    buildings = await db.buildings.find({"active": True}, {"_id": 0}).to_list(1000)
    
    # Calcular receita mensal
    monthly_revenue = sum(PLANS.get(b.get("plan", "basic"), PLANS["basic"])["price"] for b in buildings)
    
    # Contar assinantes por plano
    plan_distribution = {}
    for building in buildings:
        plan = building.get("plan", "basic")
        plan_distribution[plan] = plan_distribution.get(plan, 0) + 1
    
    # Buscar novos assinantes por mês (últimos 6 meses)
    from datetime import datetime, timedelta
    monthly_subscribers = []
    for i in range(5, -1, -1):
        month_start = (datetime.now(timezone.utc) - timedelta(days=30*i)).replace(day=1)
        month_end = (month_start + timedelta(days=32)).replace(day=1)
        
        count = await db.buildings.count_documents({
            "created_at": {
                "$gte": month_start.isoformat(),
                "$lt": month_end.isoformat()
            }
        })
        
        monthly_subscribers.append({
            "month": month_start.strftime("%b/%y"),
            "count": count
        })
    
    # Total de mensagens enviadas
    total_messages = sum(b.get("messages_used", 0) for b in buildings)
    
    return {
        "monthly_revenue": monthly_revenue,
        "total_subscribers": len(buildings),
        "plan_distribution": plan_distribution,
        "monthly_subscribers": monthly_subscribers,
        "total_messages_sent": total_messages,
        "active_buildings": len([b for b in buildings if b.get("active", False)])
    }

# ==================== PHONE IMPORT ====================

from fastapi import UploadFile, File
import csv
import io

@api_router.post("/admin/import-phones")
async def import_phones_csv(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] not in ["building_admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    try:
        # Ler arquivo CSV
        content = await file.read()
        decoded = content.decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(decoded))
        
        imported = 0
        errors = []
        
        for row in csv_reader:
            try:
                apt_number = row.get('apartamento', '').strip()
                whatsapp = row.get('telefone', '').strip()
                name = row.get('nome', '').strip()
                
                if not apt_number or not whatsapp:
                    errors.append(f"Linha com dados faltando: {row}")
                    continue
                
                # Buscar apartamento
                building_id = current_user["building_id"] if current_user["role"] == "building_admin" else None
                
                query = {"number": apt_number}
                if building_id:
                    query["building_id"] = building_id
                
                apartment = await db.apartments.find_one(query, {"_id": 0})
                
                if not apartment:
                    errors.append(f"Apartamento {apt_number} não encontrado")
                    continue
                
                # Verificar se telefone já existe
                existing = await db.resident_phones.find_one({
                    "apartment_id": apartment["id"],
                    "whatsapp": whatsapp
                })
                
                if existing:
                    continue  # Pular duplicados
                
                # Inserir telefone
                phone_data = {
                    "id": str(uuid.uuid4()),
                    "apartment_id": apartment["id"],
                    "whatsapp": whatsapp,
                    "name": name if name else None,
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                await db.resident_phones.insert_one(phone_data)
                imported += 1
                
            except Exception as e:
                errors.append(f"Erro na linha {row}: {str(e)}")
        
        return {
            "success": True,
            "imported": imported,
            "errors": errors[:10]  # Limitar a 10 erros
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao processar arquivo: {str(e)}")

@api_router.get("/admin/phones-template")
async def download_phones_template(current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["building_admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    from fastapi.responses import StreamingResponse
    
    # Criar CSV template
    csv_content = "apartamento,telefone,nome\n"
    csv_content += "101,(11) 99999-9999,João Silva\n"
    csv_content += "102,(11) 88888-8888,Maria Santos\n"
    csv_content += "103,(21) 77777-7777,Pedro Costa\n"
    
    return StreamingResponse(
        io.StringIO(csv_content),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=template_telefones.csv"}
    )

@api_router.get("/admin/all-phones")
async def get_all_phones(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "building_admin":
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    # Buscar todos os apartamentos do prédio
    apartments = await db.apartments.find(
        {"building_id": current_user["building_id"]},
        {"_id": 0}
    ).to_list(1000)
    
    # Criar um mapa de apartamentos
    apt_map = {apt["id"]: apt["number"] for apt in apartments}
    
    # Buscar todos os telefones
    all_phones = []
    for apt_id, apt_number in apt_map.items():
        phones = await db.resident_phones.find({"apartment_id": apt_id}, {"_id": 0}).to_list(1000)
        for phone in phones:
            all_phones.append({
                **phone,
                "apartment_number": apt_number
            })
    
    # Ordenar por número do apartamento
    all_phones.sort(key=lambda x: int(x["apartment_number"]) if x["apartment_number"].isdigit() else 0)
    
    return all_phones

# ==================== DOORMAN ENDPOINTS ====================

@api_router.post("/doorman/delivery", response_model=Delivery)
async def register_delivery(delivery: DeliveryCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "doorman":
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    # Verificar apartamento
    apartment = await db.apartments.find_one({"id": delivery.apartment_id}, {"_id": 0})
    if not apartment or apartment["building_id"] != current_user["building_id"]:
        raise HTTPException(status_code=404, detail="Apartamento não encontrado")
    
    # Verificar quota (exceto para planos ilimitados)
    building = await db.buildings.find_one({"id": current_user["building_id"]}, {"_id": 0})
    plan_info = PLANS.get(building.get("plan", "basic"))
    
    if not plan_info.get("unlimited_messages", False):
        if building["messages_used"] >= building["message_quota"]:
            raise HTTPException(status_code=403, detail="Cota de mensagens excedida")
    
    # Buscar telefones
    phones = await db.resident_phones.find({"apartment_id": delivery.apartment_id}, {"_id": 0}).to_list(1000)
    
    if not phones:
        raise HTTPException(status_code=400, detail="Nenhum telefone cadastrado para este apartamento")
    
    # Preparar mensagem
    if building.get("custom_message"):
        message = building["custom_message"].replace("[numero]", apartment["number"])
    else:
        message = f"ChegouAqui: Uma encomenda para o apartamento {apartment['number']} está pronta para retirada na portaria."
    
    # Enviar WhatsApp
    phones_notified = []
    for phone in phones:
        success, error = await send_whatsapp_message(phone["whatsapp"], message)
        
        # Log do envio
        log_data = {
            "id": str(uuid.uuid4()),
            "delivery_id": "",  # Será atualizado
            "phone": phone["whatsapp"],
            "status": "success" if success else "failed",
            "error_message": error,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        if success:
            phones_notified.append(phone["whatsapp"])
    
    # Registrar entrega
    delivery_id = str(uuid.uuid4())
    delivery_data = {
        "id": delivery_id,
        "apartment_id": delivery.apartment_id,
        "apartment_number": apartment["number"],
        "building_id": current_user["building_id"],
        "doorman_id": current_user["id"],
        "doorman_name": current_user["name"],
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "status": "success" if phones_notified else "failed",
        "phones_notified": phones_notified
    }
    await db.deliveries.insert_one(delivery_data)
    
    # Atualizar logs com delivery_id
    await db.whatsapp_logs.update_many(
        {"delivery_id": ""},
        {"$set": {"delivery_id": delivery_id}}
    )
    
    # Atualizar contador de mensagens
    await db.buildings.update_one(
        {"id": current_user["building_id"]},
        {"$inc": {"messages_used": len(phones_notified)}}
    )
    
    return Delivery(**delivery_data)

@api_router.get("/doorman/deliveries/today", response_model=List[Delivery])
async def get_today_deliveries(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "doorman":
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    today = datetime.now(timezone.utc).date().isoformat()
    
    deliveries = await db.deliveries.find(
        {
            "building_id": current_user["building_id"],
            "timestamp": {"$regex": f"^{today}"}
        },
        {"_id": 0}
    ).sort("timestamp", -1).to_list(1000)
    
    return [Delivery(**d) for d in deliveries]

@api_router.get("/doorman/deliveries", response_model=List[Delivery])
async def get_doorman_deliveries(
    current_user: dict = Depends(get_current_user),
    days: int = 7
):
    if current_user["role"] != "doorman":
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    # Buscar entregas dos últimos N dias
    from datetime import datetime, timedelta, timezone
    start_date = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    
    deliveries = await db.deliveries.find(
        {
            "building_id": current_user["building_id"],
            "timestamp": {"$gte": start_date}
        },
        {"_id": 0}
    ).sort("timestamp", -1).to_list(1000)
    
    return [Delivery(**d) for d in deliveries]

# ==================== PUBLIC ENDPOINTS ====================

@api_router.post("/public/register")
async def public_register_phone(request: PublicRegistrationRequest):
    # Verificar código de registro
    building = await db.buildings.find_one({"registration_code": request.registration_code.upper()}, {"_id": 0})
    if not building:
        raise HTTPException(status_code=404, detail="Código de prédio inválido")
    
    if not building.get("active", True):
        raise HTTPException(status_code=403, detail="Prédio inativo")
    
    # Buscar apartamento
    apartment = await db.apartments.find_one(
        {"building_id": building["id"], "number": request.apartment_number},
        {"_id": 0}
    )
    if not apartment:
        raise HTTPException(status_code=404, detail="Apartamento não encontrado")
    
    # Verificar se telefone já existe
    existing = await db.resident_phones.find_one({
        "apartment_id": apartment["id"],
        "whatsapp": request.whatsapp
    })
    if existing:
        raise HTTPException(status_code=400, detail="Telefone já cadastrado para este apartamento")
    
    # Cadastrar telefone
    phone_id = str(uuid.uuid4())
    phone_data = {
        "id": phone_id,
        "apartment_id": apartment["id"],
        "whatsapp": request.whatsapp,
        "name": request.name,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.resident_phones.insert_one(phone_data)
    
    return {
        "message": "Telefone cadastrado com sucesso!",
        "building_name": building["name"],
        "apartment_number": apartment["number"]
    }

@api_router.get("/public/building/{registration_code}")
async def get_building_by_code(registration_code: str):
    building = await db.buildings.find_one(
        {"registration_code": registration_code.upper()},
        {"_id": 0, "id": 1, "name": 1, "active": 1}
    )
    if not building:
        raise HTTPException(status_code=404, detail="Código inválido")
    
    return {"name": building["name"], "active": building.get("active", True)}

# ==================== MAIN ====================

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
