
from pymongo import AsyncMongoClient
from app.core.config import settings

# MongoDB client
client = AsyncMongoClient(settings.MONGODB_URI)

# RESUMIND AI database
database = client[settings.DATABASE_NAME]


async def connect_to_mongodb():
    """Connect to MongoDB and verify connection."""
    try:
        await client.admin.command("ping")
        print("MongoDB connected successfully!")
        print(f"Database: {settings.DATABASE_NAME}")
    except Exception as error:
        print(f"MongoDB connection failed: {error}")
        raise


async def close_mongodb_connection():
    """Close MongoDB connection."""
    await client.close()
    print("MongoDB connection closed.")
