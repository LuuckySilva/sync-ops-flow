from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import date
import uuid


class FuncionarioBase(BaseModel):
    nome: str = Field(..., min_length=3, max_length=200)
    cpf: str = Field(..., pattern=r'^\d{3}\.\d{3}\.\d{3}-\d{2}$')
    cargo: str = Field(..., min_length=2, max_length=100)
    setor: str = Field(..., min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    telefone: Optional[str] = Field(None, pattern=r'^\(\d{2}\) \d{4,5}-\d{4}$')


class FuncionarioCreate(FuncionarioBase):
    data_admissao: str  # formato YYYY-MM-DD
    ativo: bool = True


class FuncionarioUpdate(BaseModel):
    nome: Optional[str] = Field(None, min_length=3, max_length=200)
    cpf: Optional[str] = Field(None, pattern=r'^\d{3}\.\d{3}\.\d{3}-\d{2}$')
    cargo: Optional[str] = Field(None, min_length=2, max_length=100)
    setor: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    telefone: Optional[str] = Field(None, pattern=r'^\(\d{2}\) \d{4,5}-\d{4}$')
    ativo: Optional[bool] = None


class Funcionario(FuncionarioBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    data_admissao: str
    ativo: bool = True

    class Config:
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "nome": "João Silva",
                "cpf": "123.456.789-00",
                "cargo": "Pedreiro",
                "setor": "Obras",
                "data_admissao": "2024-01-15",
                "ativo": True,
                "email": "joao@example.com",
                "telefone": "(31) 98765-4321"
            }
        }
