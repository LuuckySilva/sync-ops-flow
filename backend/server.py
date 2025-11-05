from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
import sys

# Add backend directory to Python path for imports
sys.path.insert(0, str(Path(__file__).parent))

from routers import funcionarios_router, frequencia_router, relatorios_router

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(
    title="SANEURB - Sistema de Gestão de Obras",
    description="API para gerenciamento de funcionários, frequência, materiais, combustível e documentação",
    version="1.0.0"
)

# Make database available globally for routers
app.state.db = db

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Health check endpoint
@api_router.get("/", tags=["Health"])
async def root():
    return {
        "message": "SANEURB API - Sistema de Gestão de Obras",
        "status": "online",
        "version": "1.0.0"
    }

# Include routers
api_router.include_router(funcionarios_router)
api_router.include_router(frequencia_router)
api_router.include_router(relatorios_router)

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
