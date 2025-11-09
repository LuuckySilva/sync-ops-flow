"""
Router de autenticação
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from typing import List

from models.usuario import (
    UsuarioCreate,
    UsuarioUpdate,
    UsuarioResponse,
    LoginRequest,
    LoginResponse,
    ChangePasswordRequest
)
from auth.password import hash_password, verify_password
from auth.jwt_handler import create_access_token, ACCESS_TOKEN_EXPIRE_DAYS
from auth.dependencies import get_current_active_user, require_admin
from dependencies import get_database
from services.log_service import LogService

router = APIRouter(prefix="/auth", tags=["Autenticação"])


def get_client_ip(request: Request) -> str:
    """Obtém o IP do cliente"""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0]
    return request.client.host if request.client else "unknown"


@router.post("/register", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
async def register(
    usuario_data: UsuarioCreate,
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(require_admin)  # Apenas admin pode criar usuários
):
    """
    Registra um novo usuário (apenas administradores)
    """
    log_service = LogService(db)
    
    try:
        # Verifica se o email já existe
        existing_user = await db.usuarios.find_one({"email": usuario_data.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email já cadastrado"
            )
        
        # Cria o usuário
        user_dict = usuario_data.model_dump()
        senha = user_dict.pop("senha")
        user_dict["senha_hash"] = hash_password(senha)
        user_dict["criado_em"] = datetime.utcnow()
        user_dict["atualizado_em"] = datetime.utcnow()
        
        result = await db.usuarios.insert_one(user_dict)
        
        # Busca o usuário criado
        created_user = await db.usuarios.find_one({"_id": result.inserted_id})
        created_user["id"] = str(created_user.pop("_id"))
        created_user.pop("senha_hash")
        
        # Registra no log
        await log_service.create_log(
            usuario_email=current_user["email"],
            usuario_nome=current_user["nome"],
            acao=f"Criação de usuário: {usuario_data.email}",
            tipo="create",
            modulo="usuarios",
            status="sucesso",
            detalhes={"novo_usuario": usuario_data.email, "perfil": usuario_data.perfil},
            ip_origem=get_client_ip(request)
        )
        
        return UsuarioResponse(**created_user)
        
    except HTTPException:
        raise
    except Exception as e:
        await log_service.create_log(
            usuario_email=current_user["email"],
            usuario_nome=current_user["nome"],
            acao=f"Tentativa de criação de usuário: {usuario_data.email}",
            tipo="create",
            modulo="usuarios",
            status="erro",
            detalhes={"erro": str(e)},
            ip_origem=get_client_ip(request)
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar usuário: {str(e)}"
        )


@router.post("/login", response_model=LoginResponse)
async def login(
    credentials: LoginRequest,
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Realiza login e retorna token JWT
    """
    log_service = LogService(db)
    
    try:
        # Busca o usuário
        user = await db.usuarios.find_one({"email": credentials.email})
        
        if not user:
            await log_service.create_log(
                usuario_email=credentials.email,
                usuario_nome="Desconhecido",
                acao="Tentativa de login com email inválido",
                tipo="login",
                status="erro",
                detalhes={"motivo": "Email não encontrado"},
                ip_origem=get_client_ip(request)
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou senha incorretos"
            )
        
        # Verifica a senha
        if not verify_password(credentials.senha, user["senha_hash"]):
            await log_service.create_log(
                usuario_email=credentials.email,
                usuario_nome=user.get("nome", "Desconhecido"),
                acao="Tentativa de login com senha incorreta",
                tipo="login",
                status="erro",
                detalhes={"motivo": "Senha incorreta"},
                ip_origem=get_client_ip(request)
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou senha incorretos"
            )
        
        # Verifica se o usuário está ativo
        if not user.get("ativo", True):
            await log_service.create_log(
                usuario_email=credentials.email,
                usuario_nome=user.get("nome", "Desconhecido"),
                acao="Tentativa de login com usuário inativo",
                tipo="login",
                status="erro",
                detalhes={"motivo": "Usuário inativo"},
                ip_origem=get_client_ip(request)
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Usuário inativo"
            )
        
        # Cria o token
        access_token = create_access_token(data={"sub": user["email"]})
        
        # Prepara resposta
        user["id"] = str(user.pop("_id"))
        user.pop("senha_hash")
        
        # Registra login bem-sucedido
        await log_service.create_log(
            usuario_email=user["email"],
            usuario_nome=user["nome"],
            acao="Login realizado",
            tipo="login",
            status="sucesso",
            ip_origem=get_client_ip(request)
        )
        
        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            usuario=UsuarioResponse(**user),
            expires_in=ACCESS_TOKEN_EXPIRE_DAYS * 24 * 60 * 60  # em segundos
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao realizar login: {str(e)}"
        )


@router.get("/me", response_model=UsuarioResponse)
async def get_me(current_user: dict = Depends(get_current_active_user)):
    """
    Retorna dados do usuário autenticado
    """
    return UsuarioResponse(**current_user)


@router.put("/me/password")
async def change_password(
    password_data: ChangePasswordRequest,
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_active_user)
):
    """
    Altera a senha do usuário autenticado
    """
    log_service = LogService(db)
    
    try:
        # Busca o usuário completo (com senha)
        user = await db.usuarios.find_one({"email": current_user["email"]})
        
        # Verifica a senha atual
        if not verify_password(password_data.senha_atual, user["senha_hash"]):
            await log_service.create_log(
                usuario_email=current_user["email"],
                usuario_nome=current_user["nome"],
                acao="Tentativa de alteração de senha com senha atual incorreta",
                tipo="update",
                modulo="usuarios",
                status="erro",
                ip_origem=get_client_ip(request)
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Senha atual incorreta"
            )
        
        # Atualiza a senha
        novo_hash = hash_password(password_data.nova_senha)
        await db.usuarios.update_one(
            {"email": current_user["email"]},
            {
                "$set": {
                    "senha_hash": novo_hash,
                    "atualizado_em": datetime.utcnow()
                }
            }
        )
        
        # Registra no log
        await log_service.create_log(
            usuario_email=current_user["email"],
            usuario_nome=current_user["nome"],
            acao="Alteração de senha",
            tipo="update",
            modulo="usuarios",
            status="sucesso",
            ip_origem=get_client_ip(request)
        )
        
        return {"message": "Senha alterada com sucesso"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao alterar senha: {str(e)}"
        )


@router.get("/users", response_model=List[UsuarioResponse])
async def list_users(
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(require_admin)  # Apenas admin
):
    """
    Lista todos os usuários (apenas administradores)
    """
    try:
        cursor = db.usuarios.find().sort("criado_em", -1)
        users = await cursor.to_list(length=1000)
        
        # Remove senhas e converte IDs
        for user in users:
            user["id"] = str(user.pop("_id"))
            user.pop("senha_hash", None)
        
        return [UsuarioResponse(**user) for user in users]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao listar usuários: {str(e)}"
        )


@router.put("/users/{user_id}", response_model=UsuarioResponse)
async def update_user(
    user_id: str,
    update_data: UsuarioUpdate,
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(require_admin)  # Apenas admin
):
    """
    Atualiza um usuário (apenas administradores)
    """
    log_service = LogService(db)
    
    try:
        from bson import ObjectId
        
        # Verifica se o usuário existe
        user = await db.usuarios.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )
        
        # Prepara dados de atualização
        update_dict = update_data.model_dump(exclude_unset=True)
        
        # Se houver senha, faz o hash
        if "senha" in update_dict:
            senha = update_dict.pop("senha")
            update_dict["senha_hash"] = hash_password(senha)
        
        update_dict["atualizado_em"] = datetime.utcnow()
        
        # Atualiza o usuário
        await db.usuarios.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_dict}
        )
        
        # Busca o usuário atualizado
        updated_user = await db.usuarios.find_one({"_id": ObjectId(user_id)})
        updated_user["id"] = str(updated_user.pop("_id"))
        updated_user.pop("senha_hash")
        
        # Registra no log
        await log_service.create_log(
            usuario_email=current_user["email"],
            usuario_nome=current_user["nome"],
            acao=f"Atualização de usuário: {user['email']}",
            tipo="update",
            modulo="usuarios",
            status="sucesso",
            detalhes={"campos_alterados": list(update_dict.keys())},
            ip_origem=get_client_ip(request)
        )
        
        return UsuarioResponse(**updated_user)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar usuário: {str(e)}"
        )


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(require_admin)  # Apenas admin
):
    """
    Desativa um usuário (soft delete) - apenas administradores
    """
    log_service = LogService(db)
    
    try:
        from bson import ObjectId
        
        # Verifica se o usuário existe
        user = await db.usuarios.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )
        
        # Não permite desativar a si mesmo
        if str(user["_id"]) == current_user.get("id"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Você não pode desativar seu próprio usuário"
            )
        
        # Desativa o usuário (soft delete)
        await db.usuarios.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"ativo": False, "atualizado_em": datetime.utcnow()}}
        )
        
        # Registra no log
        await log_service.create_log(
            usuario_email=current_user["email"],
            usuario_nome=current_user["nome"],
            acao=f"Desativação de usuário: {user['email']}",
            tipo="delete",
            modulo="usuarios",
            status="sucesso",
            ip_origem=get_client_ip(request)
        )
        
        return {"message": f"Usuário {user['email']} desativado com sucesso"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao desativar usuário: {str(e)}"
        )
