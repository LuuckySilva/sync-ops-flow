from fastapi import APIRouter, HTTPException, Query, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.frequencia import RegistroFrequencia, RegistroFrequenciaCreate, RegistroFrequenciaUpdate
from services.frequencia_service import FrequenciaService
from dependencies import get_database
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/frequencia", tags=["Frequência"])


def get_service(db: AsyncIOMotorDatabase = Depends(get_database)) -> FrequenciaService:
    return FrequenciaService(db)


@router.post("", response_model=RegistroFrequencia, status_code=201)
async def registrar_frequencia(
    registro: RegistroFrequenciaCreate,
    service: FrequenciaService = Depends(get_service)
):
    """
    Registra a frequência de um funcionário.
    
    - **funcionario_id**: ID do funcionário
    - **data**: Data do registro (YYYY-MM-DD)
    - **hora_entrada**: Hora de entrada (HH:MM)
    - **hora_saida**: Hora de saída (HH:MM) - opcional
    - **tipo_dia**: Tipo do dia (util, feriado, fim_de_semana)
    """
    try:
        return await service.create(registro)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Erro ao registrar frequência: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("", response_model=List[RegistroFrequencia])
async def listar_frequencia(
    data_inicio: Optional[str] = Query(None, description="Data inicial (YYYY-MM-DD)"),
    data_fim: Optional[str] = Query(None, description="Data final (YYYY-MM-DD)"),
    funcionario_id: Optional[str] = Query(None, description="ID do funcionário"),
    service: FrequenciaService = Depends(get_service)
):
    """
    Lista registros de frequência com filtros opcionais.
    """
    try:
        return await service.get_all(
            data_inicio=data_inicio,
            data_fim=data_fim,
            funcionario_id=funcionario_id
        )
    except Exception as e:
        logger.error(f"Erro ao listar frequência: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/{registro_id}", response_model=RegistroFrequencia)
async def buscar_frequencia(
    registro_id: str,
    service: FrequenciaService = Depends(get_service)
):
    """
    Busca um registro de frequência por ID.
    """
    try:
        registro = await service.get_by_id(registro_id)
        if not registro:
            raise HTTPException(status_code=404, detail="Registro não encontrado")
        return registro
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao buscar frequência: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.put("/{registro_id}", response_model=RegistroFrequencia)
async def atualizar_frequencia(
    registro_id: str,
    update_data: RegistroFrequenciaUpdate,
    service: FrequenciaService = Depends(get_service)
):
    """
    Atualiza um registro de frequência.
    """
    try:
        registro = await service.update(registro_id, update_data)
        if not registro:
            raise HTTPException(status_code=404, detail="Registro não encontrado")
        return registro
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao atualizar frequência: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.delete("/{registro_id}", status_code=204)
async def remover_frequencia(
    registro_id: str,
    service: FrequenciaService = Depends(get_service)
):
    """
    Remove um registro de frequência.
    """
    try:
        success = await service.delete(registro_id)
        if not success:
            raise HTTPException(status_code=404, detail="Registro não encontrado")
        return None
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao remover frequência: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/funcionario/{funcionario_id}/mes/{ano}/{mes}", response_model=List[RegistroFrequencia])
async def buscar_frequencia_mes(
    funcionario_id: str,
    ano: int,
    mes: int,
    service: FrequenciaService = Depends(get_service)
):
    """
    Busca todos os registros de frequência de um funcionário em um mês específico.
    """
    try:
        if mes < 1 or mes > 12:
            raise HTTPException(status_code=400, detail="Mês inválido (deve ser entre 1 e 12)")
        
        return await service.get_by_funcionario_mes(funcionario_id, ano, mes)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao buscar frequência do mês: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")
