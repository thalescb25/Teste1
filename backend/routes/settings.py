from fastapi import APIRouter, HTTPException, Depends
from models import SystemSettings
from dependencies import get_current_user
from motor.motor_asyncio import AsyncIOMotorDatabase

router = APIRouter(prefix="/settings", tags=["settings"])

async def get_db():
    from server import db
    return db

@router.get("", response_model=SystemSettings)
async def get_settings(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    settings = await db.settings.find_one({}, {"_id": 0})
    if not settings:
        # Return default settings
        default_settings = {
            "supportEmail": "neuraone.ai@gmail.com",
            "brandName": "AcessaAqui",
            "brandSlogan": "Acesso rápido, seguro e digital. Aqui.",
            "lgpdText": "Ao prosseguir, você concorda com o uso dos seus dados exclusivamente para controle de acesso ao prédio.",
            "emailTemplates": {
                "visitorArrival": {
                    "subject": "Chegada do visitante [visitorName]",
                    "body": "[visitorName] chegou e aguarda autorização."
                }
            }
        }
        await db.settings.insert_one(default_settings)
        return default_settings
    return settings

@router.put("", response_model=SystemSettings)
async def update_settings(
    settings_data: SystemSettings,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    if current_user.get('role') != 'super_admin':
        raise HTTPException(status_code=403, detail="Only super admin can update settings")
    
    settings_dict = settings_data.dict()
    
    result = await db.settings.update_one(
        {},
        {"$set": settings_dict},
        upsert=True
    )
    
    return settings_dict

@router.get("/building/{building_id}")
async def get_building_settings(
    building_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    settings = await db.building_settings.find_one({"buildingId": building_id}, {"_id": 0})
    if not settings:
        default_settings = {
            "buildingId": building_id,
            "documentRequired": False,
            "selfieRequired": False,
            "defaultLanguage": "pt"
        }
        await db.building_settings.insert_one(default_settings)
        return default_settings
    return settings

@router.put("/building/{building_id}")
async def update_building_settings(
    building_id: str,
    settings_data: dict,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    if current_user.get('role') not in ['super_admin', 'building_admin']:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    settings_data['buildingId'] = building_id
    
    result = await db.building_settings.update_one(
        {"buildingId": building_id},
        {"$set": settings_data},
        upsert=True
    )
    
    return settings_data
