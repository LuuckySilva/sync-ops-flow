from fastapi import APIRouter, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.relatorio import RelatorioRequest, RelatorioResponse
from services.relatorio_service import RelatorioService
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/relatorios", tags=["Relatórios"])


def get_service(db: AsyncIOMotorDatabase) -> RelatorioService:
    return RelatorioService(db)


@router.post("/gerar", response_model=RelatorioResponse)
async def gerar_relatorio(request: RelatorioRequest, db: AsyncIOMotorDatabase):
    """
    Gera um relatório baseado nos parâmetros fornecidos.
    
    **Tipos de relatórios disponíveis:**
    - `frequencia`: Relatório de presença e horas trabalhadas
    - `geral`: Resumo geral de todas as áreas
    - `alimentacao`: Em desenvolvimento
    - `materiais`: Em desenvolvimento
    - `combustivel`: Em desenvolvimento
    
    **Parâmetros:**
    - **tipo**: Tipo do relatório
    - **data_inicio**: Data inicial do período (YYYY-MM-DD)
    - **data_fim**: Data final do período (YYYY-MM-DD)
    - **funcionario_id**: (Opcional) Filtrar por funcionário específico
    - **setor**: (Opcional) Filtrar por setor
    """
    try:
        service = get_service(db)
        return await service.gerar_relatorio(request)
    except NotImplementedError as e:
        raise HTTPException(status_code=501, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Erro ao gerar relatório: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")
