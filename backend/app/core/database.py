from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

client = None
database = None


async def connect_to_mongo():
    global client, database
    client = AsyncIOMotorClient(settings.DATABASE_URL)
    database = client[settings.DATABASE_NAME]
    print("Connected to MongoDB")


async def close_mongo_connection():
    global client
    if client:
        client.close()
        print("Closed MongoDB connection")


def get_database():
    return database
