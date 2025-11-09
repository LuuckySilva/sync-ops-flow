"""
Modelos de dados para usuários
"""
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, Literal
from datetime import datetime


class UsuarioBase(BaseModel):
    """Base para usuário"""
    email: EmailStr = Field(..., description="Email do usuário")
    nome: str = Field(..., min_length=3, max_length=100, description="Nome completo")
    perfil: Literal["admin", "operacional"] = Field(
        default="operacional",
        description="Perfil de acesso"
    )
    ativo: bool = Field(default=True, description="Usuário ativo")


class UsuarioCreate(UsuarioBase):
    """Dados para criação de usuário"""
    senha: str = Field(..., min_length=8, description="Senha (mínimo 8 caracteres)")
    
    @validator('senha')
    def validate_password(cls, v):
        """Valida força da senha"""
        if len(v) < 8:
            raise ValueError('Senha deve ter no mínimo 8 caracteres')
        
        # Verifica se tem pelo menos uma letra e um número
        has_letter = any(c.isalpha() for c in v)
        has_digit = any(c.isdigit() for c in v)
        
        if not (has_letter and has_digit):
            raise ValueError('Senha deve conter letras e números')
        
        return v


class UsuarioUpdate(BaseModel):
    """Dados para atualização de usuário"""
    nome: Optional[str] = Field(None, min_length=3, max_length=100)
    perfil: Optional[Literal["admin", "operacional"]] = None
    ativo: Optional[bool] = None
    senha: Optional[str] = Field(None, min_length=8)
    
    @validator('senha')
    def validate_password(cls, v):
        """Valida força da senha"""
        if v is None:
            return v
        
        if len(v) < 8:
            raise ValueError('Senha deve ter no mínimo 8 caracteres')
        
        has_letter = any(c.isalpha() for c in v)
        has_digit = any(c.isdigit() for c in v)
        
        if not (has_letter and has_digit):
            raise ValueError('Senha deve conter letras e números')
        
        return v


class UsuarioResponse(UsuarioBase):
    """Resposta de usuário (sem senha)"""
    id: str = Field(..., description="ID do usuário")
    criado_em: datetime = Field(..., description="Data de criação")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "email": "usuario@example.com",
                "nome": "João Silva",
                "perfil": "operacional",
                "ativo": True,
                "criado_em": "2025-01-10T10:00:00"
            }
        }


class LoginRequest(BaseModel):
    """Requisição de login"""
    email: EmailStr = Field(..., description="Email do usuário")
    senha: str = Field(..., description="Senha")
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "usuario@example.com",
                "senha": "SenhaSegura123"
            }
        }


class LoginResponse(BaseModel):
    """Resposta de login"""
    access_token: str = Field(..., description="Token JWT")
    token_type: str = Field(default="bearer", description="Tipo do token")
    usuario: UsuarioResponse = Field(..., description="Dados do usuário")
    expires_in: int = Field(..., description="Tempo de expiração em segundos")
    
    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "expires_in": 2592000,
                "usuario": {
                    "id": "507f1f77bcf86cd799439011",
                    "email": "usuario@example.com",
                    "nome": "João Silva",
                    "perfil": "operacional",
                    "ativo": True,
                    "criado_em": "2025-01-10T10:00:00"
                }
            }
        }


class ChangePasswordRequest(BaseModel):
    """Requisição de mudança de senha"""
    senha_atual: str = Field(..., description="Senha atual")
    nova_senha: str = Field(..., min_length=8, description="Nova senha")
    
    @validator('nova_senha')
    def validate_password(cls, v):
        """Valida força da senha"""
        if len(v) < 8:
            raise ValueError('Senha deve ter no mínimo 8 caracteres')
        
        has_letter = any(c.isalpha() for c in v)
        has_digit = any(c.isdigit() for c in v)
        
        if not (has_letter and has_digit):
            raise ValueError('Senha deve conter letras e números')
        
        return v
