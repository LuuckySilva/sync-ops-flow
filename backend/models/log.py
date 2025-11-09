"""
Modelos de dados para logs de auditoria
"""
from pydantic import BaseModel, Field
from typing import Optional, Literal, Dict, Any
from datetime import datetime


class LogBase(BaseModel):
    """Base para log de auditoria"""
    usuario_email: str = Field(..., description="Email do usuário que executou a ação")
    usuario_nome: str = Field(..., description="Nome do usuário")
    acao: str = Field(..., description="Ação executada")
    tipo: Literal["login", "import", "export", "create", "update", "delete"] = Field(
        ...,
        description="Tipo de ação"
    )
    modulo: Optional[str] = Field(None, description="Módulo afetado (frequencia, alimentacao, materiais, usuarios)")
    status: Literal["sucesso", "erro"] = Field(..., description="Status da operação")
    detalhes: Optional[Dict[str, Any]] = Field(None, description="Detalhes adicionais da operação")
    ip_origem: Optional[str] = Field(None, description="IP de origem da requisição")


class LogCreate(LogBase):
    """Dados para criação de log"""
    pass


class LogResponse(LogBase):
    """Resposta de log"""
    id: str = Field(..., description="ID do log")
    data_hora: datetime = Field(..., description="Data e hora da ação")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "usuario_email": "usuario@example.com",
                "usuario_nome": "João Silva",
                "acao": "Importação de planilha de frequência",
                "tipo": "import",
                "modulo": "frequencia",
                "status": "sucesso",
                "detalhes": {
                    "total_processados": 50,
                    "criados": 48,
                    "erros": 2
                },
                "ip_origem": "192.168.1.100",
                "data_hora": "2025-01-10T10:30:00"
            }
        }


class LogFilter(BaseModel):
    """Filtros para busca de logs"""
    usuario_email: Optional[str] = Field(None, description="Filtrar por email do usuário")
    tipo: Optional[Literal["login", "import", "export", "create", "update", "delete"]] = Field(
        None,
        description="Filtrar por tipo de ação"
    )
    modulo: Optional[str] = Field(None, description="Filtrar por módulo")
    status: Optional[Literal["sucesso", "erro"]] = Field(None, description="Filtrar por status")
    data_inicio: Optional[datetime] = Field(None, description="Data inicial")
    data_fim: Optional[datetime] = Field(None, description="Data final")
    limite: int = Field(default=100, ge=1, le=1000, description="Limite de registros")
    
    class Config:
        json_schema_extra = {
            "example": {
                "tipo": "import",
                "status": "sucesso",
                "data_inicio": "2025-01-01T00:00:00",
                "data_fim": "2025-01-31T23:59:59",
                "limite": 50
            }
        }
