from fastapi import FastAPI, APIRouter, Request
from fastapi.responses import JSONResponse
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

# Dependency injection for database
@app.middleware("http")
async def add_db_to_request(request: Request, call_next):
    """Middleware para injetar o database em todas as rotas"""
    request.state.db = db
    response = await call_next(request)
    return response

# Database dependency
def get_database(request: Request):
    return request.state.db

# Update router dependencies to use database
for router in [funcionarios_router, frequencia_router, relatorios_router]:
    for route in router.routes:
        if hasattr(route, 'dependant'):
            # Inject db dependency
            original_endpoint = route.endpoint
            async def new_endpoint(*args, **kwargs):
                kwargs['db'] = db
                return await original_endpoint(*args, **kwargs)
            route.endpoint = new_endpoint

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
