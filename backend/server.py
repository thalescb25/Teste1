from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional
from datetime import datetime, timedelta
import qrcode
import io
import base64

from models import (
    UserCreate, UserLogin, User, UserInDB,
    VisitorCreate, Visitor
)
from auth import verify_password, get_password_hash, create_access_token
from dependencies import get_current_user

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="AcessaAqui API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Import route modules
from routes import buildings, companies, visitors, plans, settings

# Include routers
api_router.include_router(buildings.router)
api_router.include_router(companies.router)
api_router.include_router(visitors.router)
api_router.include_router(plans.router)
api_router.include_router(settings.router)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# ============= AUTHENTICATION ROUTES =============

@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    try:
        # Check if user already exists
        existing_user = await db.users.find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash password
        hashed_password = get_password_hash(user_data.password)
        
        # Create user
        user_dict = user_data.dict()
        user_in_db = UserInDB(
            **{k: v for k, v in user_dict.items() if k != 'password'},
            password=hashed_password
        )
        
        await db.users.insert_one(user_in_db.dict())
        
        return {"success": True, "message": "User created successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error registering user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error registering user"
        )

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    try:
        # Find user
        user = await db.users.find_one({"email": credentials.email})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Verify password
        if not verify_password(credentials.password, user["password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Create access token
        access_token = create_access_token(
            data={
                "sub": user["id"],
                "role": user["role"],
                "building": user["building"]
            }
        )
        
        # Return user data without password
        user_response = {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "role": user["role"],
            "building": user["building"]
        }
        
        return {
            "success": True,
            "token": access_token,
            "user": user_response
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error during login: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error during login"
        )


# ============= VISITOR ROUTES =============

@api_router.get("/visitors")
async def get_visitors(
    status_filter: Optional[str] = "all",
    search: Optional[str] = "",
    current_user: dict = Depends(get_current_user)
):
    try:
        # Build query
        query = {"building": current_user["building"]}
        
        if status_filter != "all":
            query["status"] = status_filter
        
        if search:
            query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"company": {"$regex": search, "$options": "i"}}
            ]
        
        visitors = await db.visitors.find(query).sort("checkInTime", -1).to_list(1000)
        
        # Remove _id field
        for visitor in visitors:
            visitor.pop("_id", None)
        
        return {"success": True, "data": visitors}
    except Exception as e:
        logger.error(f"Error fetching visitors: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching visitors"
        )

@api_router.post("/visitors")
async def create_visitor(
    visitor_data: VisitorCreate,
    current_user: dict = Depends(get_current_user)
):
    try:
        visitor = Visitor(
            **visitor_data.dict(),
            userId=current_user["user_id"],
            building=current_user["building"]
        )
        
        await db.visitors.insert_one(visitor.dict())
        
        visitor_dict = visitor.dict()
        visitor_dict.pop("_id", None)
        
        return {"success": True, "data": visitor_dict}
    except Exception as e:
        logger.error(f"Error creating visitor: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating visitor"
        )

@api_router.put("/visitors/{visitor_id}/checkout")
async def checkout_visitor(
    visitor_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        result = await db.visitors.update_one(
            {"id": visitor_id, "building": current_user["building"]},
            {
                "$set": {
                    "checkOutTime": datetime.utcnow(),
                    "status": "checked-out",
                    "updatedAt": datetime.utcnow()
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Visitor not found"
            )
        
        return {"success": True, "message": "Check-out successful"}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error checking out visitor: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error checking out visitor"
        )

@api_router.get("/visitors/{visitor_id}/qrcode")
async def get_visitor_qrcode(
    visitor_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        visitor = await db.visitors.find_one({
            "id": visitor_id,
            "building": current_user["building"]
        })
        
        if not visitor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Visitor not found"
            )
        
        # Generate QR code
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(visitor["qrCode"])
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        img_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        return {
            "success": True,
            "qrCode": visitor["qrCode"],
            "qrCodeImage": f"data:image/png;base64,{img_base64}"
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error generating QR code: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error generating QR code"
        )


# ============= STATS ROUTES =============

@api_router.get("/stats")
async def get_stats(current_user: dict = Depends(get_current_user)):
    try:
        building = current_user["building"]
        now = datetime.utcnow()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Today's visitors
        today_visitors = await db.visitors.count_documents({
            "building": building,
            "checkInTime": {"$gte": today_start}
        })
        
        # Active visitors (checked in but not checked out)
        active_visitors = await db.visitors.count_documents({
            "building": building,
            "status": "checked-in"
        })
        
        # Total visitors this month
        total_month = await db.visitors.count_documents({
            "building": building,
            "checkInTime": {"$gte": month_start}
        })
        
        # Average stay time (simplified calculation)
        completed_visits = await db.visitors.find({
            "building": building,
            "status": "checked-out",
            "checkOutTime": {"$ne": None}
        }).limit(100).to_list(100)
        
        if completed_visits:
            total_minutes = 0
            for visit in completed_visits:
                delta = visit["checkOutTime"] - visit["checkInTime"]
                total_minutes += delta.total_seconds() / 60
            avg_minutes = total_minutes / len(completed_visits)
            hours = int(avg_minutes // 60)
            minutes = int(avg_minutes % 60)
            avg_stay = f"{hours}h {minutes}min"
        else:
            avg_stay = "0h 0min"
        
        return {
            "success": True,
            "data": {
                "todayVisitors": today_visitors,
                "activeVisitors": active_visitors,
                "totalVisitorsMonth": total_month,
                "averageStayTime": avg_stay
            }
        }
    except Exception as e:
        logger.error(f"Error fetching stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching stats"
        )


# ============= NEWSLETTER ROUTES =============

@api_router.post("/newsletter/subscribe")
async def subscribe_newsletter(data: NewsletterSubscribe):
    try:
        # Check if already subscribed
        existing = await db.newsletter.find_one({"email": data.email})
        if existing:
            return {"success": True, "message": "Email already subscribed"}
        
        newsletter = Newsletter(email=data.email)
        await db.newsletter.insert_one(newsletter.dict())
        
        return {"success": True, "message": "Successfully subscribed"}
    except Exception as e:
        logger.error(f"Error subscribing to newsletter: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error subscribing to newsletter"
        )


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()