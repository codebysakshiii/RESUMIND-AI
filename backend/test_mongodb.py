
import asyncio

from app.database.connection import (
    connect_to_mongodb,
    close_mongodb_connection
)


async def main():
    try:
        await connect_to_mongodb()
    finally:
        await close_mongodb_connection()


if __name__ == "__main__":
    asyncio.run(main())
