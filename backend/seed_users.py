"""
Script para criar usuários de teste no sistema
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from auth.password import hash_password
import os
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()

# Usuários de teste
TEST_USERS = [
    {
        "email": "lukasantonyo@hotmail.com",
        "nome": "Lukas Antonio",
        "senha": "Testeintegrado1",
        "perfil": "admin",
        "ativo": True
    },
    {
        "email": "saneurb.obra@gmail.com",
        "nome": "SANEURB - Obras",
        "senha": "Testeintegrado1",
        "perfil": "admin",
        "ativo": True
    },
    {
        "email": "operacional@syncops.com",
        "nome": "Usuário Operacional",
        "senha": "Testeintegrado1",
        "perfil": "operacional",
        "ativo": True
    }
]


async def seed_users():
    """Cria usuários de teste no banco de dados"""
    
    # Conecta ao MongoDB
    mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
    db_name = os.environ.get("DB_NAME", "test_database")
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("🔄 Criando usuários de teste...")
    
    created_count = 0
    updated_count = 0
    
    for user_data in TEST_USERS:
        try:
            # Verifica se o usuário já existe
            existing_user = await db.usuarios.find_one({"email": user_data["email"]})
            
            if existing_user:
                print(f"⚠️  Usuário {user_data['email']} já existe - atualizando senha...")
                
                # Atualiza a senha
                await db.usuarios.update_one(
                    {"email": user_data["email"]},
                    {
                        "$set": {
                            "senha_hash": hash_password(user_data["senha"]),
                            "perfil": user_data["perfil"],
                            "ativo": user_data["ativo"],
                            "atualizado_em": datetime.utcnow()
                        }
                    }
                )
                updated_count += 1
            else:
                # Cria novo usuário
                user_doc = {
                    "email": user_data["email"],
                    "nome": user_data["nome"],
                    "senha_hash": hash_password(user_data["senha"]),
                    "perfil": user_data["perfil"],
                    "ativo": user_data["ativo"],
                    "criado_em": datetime.utcnow(),
                    "atualizado_em": datetime.utcnow()
                }
                
                await db.usuarios.insert_one(user_doc)
                created_count += 1
                print(f"✅ Usuário {user_data['email']} criado com sucesso!")
                
        except Exception as e:
            print(f"❌ Erro ao processar {user_data['email']}: {e}")
    
    # Fecha conexão
    client.close()
    
    print(f"\n📊 Resumo:")
    print(f"   Criados: {created_count}")
    print(f"   Atualizados: {updated_count}")
    print(f"   Total: {created_count + updated_count}")
    
    print(f"\n🔐 Credenciais de Teste:")
    for user in TEST_USERS:
        print(f"\n   Email: {user['email']}")
        print(f"   Senha: {user['senha']}")
        print(f"   Perfil: {user['perfil']}")
    
    print(f"\n✅ Seed de usuários concluído!")


if __name__ == "__main__":
    asyncio.run(seed_users())
