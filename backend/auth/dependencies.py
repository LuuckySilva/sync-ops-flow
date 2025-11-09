"""
Dependências de autenticação para FastAPI
"""
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional

from auth.jwt_handler import decode_access_token
from dependencies import get_database

# Security scheme para Swagger UI
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_database)
) -> dict:
    """
    Obtém o usuário atual a partir do token JWT
    
    Args:
        credentials: Credenciais HTTP Bearer
        db: Instância do banco de dados
        
    Returns:
        Dados do usuário
        
    Raises:
        HTTPException: Se o token for inválido ou usuário não encontrado
    """
    token = credentials.credentials
    
    # Decodifica o token
    payload = decode_access_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    email: str = payload.get("sub")
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Busca o usuário no banco
    user = await db.usuarios.find_one({"email": email})
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não encontrado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Remove senha e converte ID
    user.pop("senha_hash", None)
    user["id"] = str(user.pop("_id"))
    
    return user


async def get_current_active_user(
    current_user: dict = Depends(get_current_user)
) -> dict:
    """
    Verifica se o usuário está ativo
    
    Args:
        current_user: Usuário atual
        
    Returns:
        Usuário ativo
        
    Raises:
        HTTPException: Se o usuário estiver inativo
    """
    if not current_user.get("ativo", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário inativo"
        )
    
    return current_user


async def require_admin(
    current_user: dict = Depends(get_current_active_user)
) -> dict:
    """
    Requer que o usuário seja administrador
    
    Args:
        current_user: Usuário atual
        
    Returns:
        Usuário admin
        
    Raises:
        HTTPException: Se o usuário não for admin
    """
    if current_user.get("perfil") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado. Apenas administradores podem acessar este recurso."
        )
    
    return current_user


async def get_optional_user(
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_database)
) -> Optional[dict]:
    """
    Tenta obter o usuário atual, mas não falha se não houver token
    Útil para endpoints que são públicos mas podem ter comportamento diferente para usuários logados
    
    Args:
        request: Request do FastAPI
        db: Instância do banco de dados
        
    Returns:
        Dados do usuário ou None
    """
    auth_header = request.headers.get("Authorization")
    
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    
    token = auth_header.replace("Bearer ", "")
    payload = decode_access_token(token)
    
    if payload is None:
        return None
    
    email = payload.get("sub")
    if not email:
        return None
    
    user = await db.usuarios.find_one({"email": email})
    if user:
        user.pop("senha_hash", None)
    
    return user
