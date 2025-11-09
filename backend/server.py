# server.py
from fastapi import FastAPI, APIRouter, Request, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pathlib import Path
from datetime import datetime
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
from routers.excel_router import router as excel_router
from routers.auth_router import router as auth_router
from routers.logs_router import router as logs_router

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
        "message": "Sync Ops Flow - Sistema de Gestão Interna",
        "status": "online",
        "version": "2.0.0"
    }


@api_router.get("/status", tags=["Health"])
async def system_status(db: AsyncIOMotorDatabase = Depends(get_database)):
    """Retorna status geral do sistema"""
    try:
        # Testa conexão com MongoDB
        await db.command("ping")
        db_status = "connected"
        
        # Conta registros nas coleções principais
        collections_count = {
            "usuarios": await db.usuarios.count_documents({}),
            "frequencia": await db.frequencia.count_documents({}),
            "alimentacao": await db.alimentacao.count_documents({}),
            "materiais": await db.materiais.count_documents({}),
            "logs": await db.logs.count_documents({})
        }
        
        return {
            "status": "online",
            "database": db_status,
            "collections": collections_count,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "status": "degraded",
            "database": "error",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


@api_router.get("/version", tags=["Health"])
async def get_version():
    """Retorna versão e data do backend"""
    return {
        "version": "2.0.0",
        "release_date": "2025-11-09",
        "name": "Sync Ops Flow",
        "features": [
            "Autenticação JWT (30 dias)",
            "Sistema de perfis (admin/operacional)",
            "Logs de auditoria",
            "Importação/Exportação Excel/CSV",
            "Gestão de frequência, alimentação e materiais"
        ],
        "auth": {
            "type": "JWT Bearer",
            "token_expires_in": "30 days"
        }
    }

# --- Inclusão dos routers ---
api_router.include_router(auth_router)
api_router.include_router(logs_router)
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

