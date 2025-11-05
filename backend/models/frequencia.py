from pydantic import BaseModel, Field
from typing import Optional, Literal
import uuid


class RegistroFrequenciaBase(BaseModel):
    funcionario_id: str
    data: str  # formato YYYY-MM-DD
    tipo_dia: Literal['util', 'feriado', 'fim_de_semana'] = 'util'
    hora_entrada: Optional[str] = Field(None, pattern=r'^\d{2}:\d{2}$')
    hora_saida: Optional[str] = Field(None, pattern=r'^\d{2}:\d{2}$')
    observacao: Optional[str] = None


class RegistroFrequenciaCreate(RegistroFrequenciaBase):
    pass


class RegistroFrequenciaUpdate(BaseModel):
    hora_entrada: Optional[str] = Field(None, pattern=r'^\d{2}:\d{2}$')
    hora_saida: Optional[str] = Field(None, pattern=r'^\d{2}:\d{2}$')
    tipo_dia: Optional[Literal['util', 'feriado', 'fim_de_semana']] = None
    observacao: Optional[str] = None


class RegistroFrequencia(RegistroFrequenciaBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nome: Optional[str] = None  # Populated from funcionario
    total_horas: Optional[float] = None

    class Config:
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174001",
                "funcionario_id": "123e4567-e89b-12d3-a456-426614174000",
                "nome": "João Silva",
                "data": "2025-01-20",
                "hora_entrada": "07:00",
                "hora_saida": "17:00",
                "total_horas": 9.0,
                "tipo_dia": "util"
            }
        }
