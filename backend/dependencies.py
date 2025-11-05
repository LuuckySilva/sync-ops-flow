"""
Dependency injection para FastAPI
"""
from fastapi import Request
from motor.motor_asyncio import AsyncIOMotorDatabase


def get_database(request: Request) -> AsyncIOMotorDatabase:
    """Retorna a instância do database"""
    return request.app.state.db
