"""
Router de logs de auditoria
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional
from datetime import datetime

from models.log import LogResponse, LogFilter
from auth.dependencies import require_admin
from dependencies import get_database
from services.log_service import LogService

router = APIRouter(prefix="/logs", tags=["Logs de Auditoria"])


@router.get("/", response_model=List[LogResponse])
async def get_logs(
    usuario_email: Optional[str] = Query(None, description="Filtrar por email do usuário"),
    tipo: Optional[str] = Query(None, description="Filtrar por tipo (login, import, export, create, update, delete)"),
    modulo: Optional[str] = Query(None, description="Filtrar por módulo"),
    status: Optional[str] = Query(None, description="Filtrar por status (sucesso, erro)"),
    data_inicio: Optional[str] = Query(None, description="Data inicial (ISO format)"),
    data_fim: Optional[str] = Query(None, description="Data final (ISO format)"),
    limite: int = Query(100, ge=1, le=1000, description="Limite de registros"),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(require_admin)  # Apenas admin
):
    """
    Retorna logs de auditoria com filtros (apenas administradores)
    """
    try:
        log_service = LogService(db)
        
        # Converte datas se fornecidas
        data_inicio_dt = None
        data_fim_dt = None
        
        if data_inicio:
            try:
                data_inicio_dt = datetime.fromisoformat(data_inicio.replace('Z', '+00:00'))
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Formato de data_inicio inválido. Use ISO format (YYYY-MM-DDTHH:MM:SS)"
                )
        
        if data_fim:
            try:
                data_fim_dt = datetime.fromisoformat(data_fim.replace('Z', '+00:00'))
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Formato de data_fim inválido. Use ISO format (YYYY-MM-DDTHH:MM:SS)"
                )
        
        # Busca logs
        logs = await log_service.get_logs(
            usuario_email=usuario_email,
            tipo=tipo,
            modulo=modulo,
            status=status,
            data_inicio=data_inicio_dt,
            data_fim=data_fim_dt,
            limite=limite
        )
        
        return [LogResponse(**log) for log in logs]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar logs: {str(e)}"
        )


@router.get("/recent", response_model=List[LogResponse])
async def get_recent_logs(
    limite: int = Query(50, ge=1, le=500, description="Número de logs recentes"),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(require_admin)  # Apenas admin
):
    """
    Retorna os logs mais recentes (apenas administradores)
    """
    try:
        log_service = LogService(db)
        logs = await log_service.get_recent_logs(limite=limite)
        
        return [LogResponse(**log) for log in logs]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar logs recentes: {str(e)}"
        )


@router.get("/stats")
async def get_logs_stats(
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(require_admin)  # Apenas admin
):
    """
    Retorna estatísticas de logs (apenas administradores)
    """
    try:
        log_service = LogService(db)
        stats = await log_service.get_logs_stats()
        
        return {
            "message": "Estatísticas de logs",
            "data": stats
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao obter estatísticas: {str(e)}"
        )


@router.get("/me", response_model=List[LogResponse])
async def get_my_logs(
    limite: int = Query(100, ge=1, le=500, description="Limite de registros"),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(require_admin)
):
    """
    Retorna os logs do usuário autenticado
    """
    try:
        log_service = LogService(db)
        logs = await log_service.get_user_logs(
            usuario_email=current_user["email"],
            limite=limite
        )
        
        return [LogResponse(**log) for log in logs]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar seus logs: {str(e)}"
        )
