# server.py
from fastapi import FastAPI, APIRouter, Request, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pathlib import Path
import logging
import os
import sys

# --- Configurações iniciais ---
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Adiciona o diretório atual ao path (para os imports funcionarem)
sys.path.insert(0, str(ROOT_DIR))

# Importa os routers
from routers import funcionarios_router, frequencia_router, relatorios_router
from routers.excel import router as excel_router

# --- Configuração do Logger ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# --- Criação do app FastAPI ---
app = FastAPI(
    title="SANEURB - Sistema de Gestão de Obras",
    description="API para gerenciamento de funcionários, frequência, materiais, combustível e documentação",
    version="1.0.0"
)

# --- Conexão com o MongoDB ---
try:
    mongo_url = os.environ["MONGO_URL"]
    db_name = os.environ["DB_NAME"]

    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    app.state.db = db

    logger.info(f"✅ Conectado ao MongoDB: {db_name}")
except Exception as e:
    logger.error(f"❌ Erro ao conectar ao MongoDB: {e}")
    raise RuntimeError("Falha na conexão com o banco de dados")

# --- Dependência para acessar o DB nas rotas ---
def get_database(request: Request):
    return request.app.state.db

# --- Router principal (com prefixo /api) ---
api_router = APIRouter(prefix="/api")

@api_router.get("/", tags=["Health"])
async def health_check():
    """Verifica o status da API"""
    return {
        "message": "SANEURB API - Sistema de Gestão de Obras",
        "status": "online",
        "version": "1.0.0"
    }

# --- Inclusão dos routers ---
api_router.include_router(funcionarios_router)
api_router.include_router(frequencia_router)
api_router.include_router(relatorios_router)
api_router.include_router(excel_router)

# --- Adiciona o router principal à aplicação ---
app.include_router(api_router)

# --- Middleware CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Eventos do ciclo de vida ---
@app.on_event("startup")
async def on_startup():
    logger.info("🚀 Servidor iniciado e pronto para uso")

@app.on_event("shutdown")
async def on_shutdown():
    client.close()
    logger.info("🛑 Conexão com o MongoDB encerrada")

