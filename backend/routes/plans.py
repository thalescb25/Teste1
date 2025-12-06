from fastapi import APIRouter, HTTPException, Depends
from typing import List
from models import Plan, PlanUpdate
from dependencies import get_current_user
from motor.motor_asyncio import AsyncIOMotorDatabase

router = APIRouter(prefix="/plans", tags=["plans"])

async def get_db():
    from server import db
    return db

@router.get("", response_model=List[Plan])
async def get_plans(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    plans = await db.plans.find({}, {"_id": 0}).to_list(100)
    return plans

@router.put("/{plan_id}", response_model=Plan)
async def update_plan(
    plan_id: str,
    plan_data: PlanUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    if current_user.get('role') != 'super_admin':
        raise HTTPException(status_code=403, detail="Only super admin can update plans")
    
    update_data = {k: v for k, v in plan_data.dict().items() if v is not None}
    
    result = await db.plans.update_one(
        {"id": plan_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    plan = await db.plans.find_one({"id": plan_id}, {"_id": 0})
    return plan
