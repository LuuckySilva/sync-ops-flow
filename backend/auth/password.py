"""
Gerenciamento de senhas com Argon2
"""
from passlib.context import CryptContext

# Configuração do contexto de criptografia usando Argon2
pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto",
    argon2__time_cost=2,
    argon2__memory_cost=512,
    argon2__parallelism=2
)


def hash_password(password: str) -> str:
    """
    Gera hash da senha usando Argon2
    
    Args:
        password: Senha em texto plano
        
    Returns:
        Hash da senha
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica se a senha corresponde ao hash
    
    Args:
        plain_password: Senha em texto plano
        hashed_password: Hash armazenado
        
    Returns:
        True se a senha for válida, False caso contrário
    """
    return pwd_context.verify(plain_password, hashed_password)
