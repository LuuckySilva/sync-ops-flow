from fastapi import APIRouter, HTTPException, Query, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.funcionario import Funcionario, FuncionarioCreate, FuncionarioUpdate
from services.funcionario_service import FuncionarioService
from dependencies import get_database
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/funcionarios", tags=["Funcionários"])


def get_service(db: AsyncIOMotorDatabase = Depends(get_database)) -> FuncionarioService:
    """Dependency injection para o serviço"""
    return FuncionarioService(db)


@router.post("", response_model=Funcionario, status_code=201)
async def criar_funcionario(
    funcionario: FuncionarioCreate,
    service: FuncionarioService = Depends(get_service)
):
    """
    Cria um novo funcionário.
    
    - **nome**: Nome completo do funcionário
    - **cpf**: CPF no formato XXX.XXX.XXX-XX
    - **cargo**: Cargo/função
    - **setor**: Setor de trabalho
    - **data_admissao**: Data de admissão (YYYY-MM-DD)
    """
    try:
        return await service.create(funcionario)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Erro ao criar funcionário: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("", response_model=List[Funcionario])
async def listar_funcionarios(
    ativo: Optional[bool] = Query(None, description="Filtrar por status ativo/inativo"),
    setor: Optional[str] = Query(None, description="Filtrar por setor"),
    service: FuncionarioService = Depends(get_service)
):
    """
    Lista todos os funcionários com filtros opcionais.
    """
    try:
        return await service.get_all(ativo=ativo, setor=setor)
    except Exception as e:
        logger.error(f"Erro ao listar funcionários: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/{funcionario_id}", response_model=Funcionario)
async def buscar_funcionario(
    funcionario_id: str,
    service: FuncionarioService = Depends(get_service)
):
    """
    Busca um funcionário por ID.
    """
    try:
        funcionario = await service.get_by_id(funcionario_id)
        if not funcionario:
            raise HTTPException(status_code=404, detail="Funcionário não encontrado")
        return funcionario
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao buscar funcionário: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.put("/{funcionario_id}", response_model=Funcionario)
async def atualizar_funcionario(
    funcionario_id: str,
    update_data: FuncionarioUpdate,
    service: FuncionarioService = Depends(get_service)
):
    """
    Atualiza um funcionário existente.
    """
    try:
        funcionario = await service.update(funcionario_id, update_data)
        if not funcionario:
            raise HTTPException(status_code=404, detail="Funcionário não encontrado")
        return funcionario
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao atualizar funcionário: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.delete("/{funcionario_id}", status_code=204)
async def desativar_funcionario(funcionario_id: str, db: AsyncIOMotorDatabase):
    """
    Desativa um funcionário (soft delete).
    """
    try:
        service = get_service(db)
        success = await service.delete(funcionario_id)
        if not success:
            raise HTTPException(status_code=404, detail="Funcionário não encontrado")
        return None
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao desativar funcionário: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/cpf/{cpf}", response_model=Funcionario)
async def buscar_por_cpf(cpf: str, db: AsyncIOMotorDatabase):
    """
    Busca um funcionário por CPF.
    """
    try:
        service = get_service(db)
        funcionario = await service.get_by_cpf(cpf)
        if not funcionario:
            raise HTTPException(status_code=404, detail="Funcionário não encontrado")
        return funcionario
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao buscar funcionário por CPF: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")
