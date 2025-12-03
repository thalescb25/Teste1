import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
from auth import get_password_hash
from models import UserInDB

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def seed_database():
    # MongoDB connection
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    # Check if users already exist
    user_count = await db.users.count_documents({})
    
    if user_count > 0:
        print("Database already seeded. Skipping...")
        client.close()
        return
    
    # Create admin user
    admin_user = UserInDB(
        email="admin@condominiocentral.com.br",
        password=get_password_hash("admin123"),
        name="Administrador",
        role="admin",
        building="Edifício Central Park"
    )
    
    # Create receptionist user
    receptionist_user = UserInDB(
        email="recepcao@condominiocentral.com.br",
        password=get_password_hash("recepcao123"),
        name="Recepção",
        role="receptionist",
        building="Edifício Central Park"
    )
    
    await db.users.insert_one(admin_user.dict())
    await db.users.insert_one(receptionist_user.dict())
    
    print("✅ Database seeded successfully!")
    print("Admin: admin@condominiocentral.com.br / admin123")
    print("Receptionist: recepcao@condominiocentral.com.br / recepcao123")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
