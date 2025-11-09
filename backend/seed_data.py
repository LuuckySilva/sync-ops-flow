"""
Script para popular o banco de dados com dados fictícios para testes
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
import random
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
db_name = os.environ['DB_NAME']

# Dados fictícios
funcionarios_mock = [
    {
        "id": "func-001",
        "nome": "Carlos Alberto Silva",
        "cpf": "123.456.789-01",
        "cargo": "Gerente de Projetos",
        "setor": "Administrativo",
        "data_admissao": "2023-01-15",
        "ativo": True,
        "email": "carlos.silva@workflowpro.com",
        "telefone": "(11) 98765-4321"
    },
    {
        "id": "func-002",
        "nome": "Ana Paula Santos",
        "cpf": "234.567.890-12",
        "cargo": "Desenvolvedora Sênior",
        "setor": "TI",
        "data_admissao": "2023-03-20",
        "ativo": True,
        "email": "ana.santos@workflowpro.com",
        "telefone": "(11) 98765-4322"
    },
    {
        "id": "func-003",
        "nome": "Ricardo Oliveira",
        "cpf": "345.678.901-23",
        "cargo": "Analista de RH",
        "setor": "Recursos Humanos",
        "data_admissao": "2023-05-10",
        "ativo": True,
        "email": "ricardo.oliveira@workflowpro.com",
        "telefone": "(11) 98765-4323"
    },
    {
        "id": "func-004",
        "nome": "Mariana Costa",
        "cpf": "456.789.012-34",
        "cargo": "Designer UX/UI",
        "setor": "TI",
        "data_admissao": "2023-07-01",
        "ativo": True,
        "email": "mariana.costa@workflowpro.com",
        "telefone": "(11) 98765-4324"
    },
    {
        "id": "func-005",
        "nome": "João Pedro Ferreira",
        "cpf": "567.890.123-45",
        "cargo": "Coordenador de Vendas",
        "setor": "Comercial",
        "data_admissao": "2023-09-15",
        "ativo": True,
        "email": "joao.ferreira@workflowpro.com",
        "telefone": "(11) 98765-4325"
    },
    {
        "id": "func-006",
        "nome": "Beatriz Lima",
        "cpf": "678.901.234-56",
        "cargo": "Analista Financeiro",
        "setor": "Financeiro",
        "data_admissao": "2024-01-10",
        "ativo": True,
        "email": "beatriz.lima@workflowpro.com",
        "telefone": "(11) 98765-4326"
    },
    {
        "id": "func-007",
        "nome": "Fernando Alves",
        "cpf": "789.012.345-67",
        "cargo": "Desenvolvedor Júnior",
        "setor": "TI",
        "data_admissao": "2024-02-01",
        "ativo": True,
        "email": "fernando.alves@workflowpro.com",
        "telefone": "(11) 98765-4327"
    },
    {
        "id": "func-008",
        "nome": "Juliana Rodrigues",
        "cpf": "890.123.456-78",
        "cargo": "Assistente Administrativo",
        "setor": "Administrativo",
        "data_admissao": "2024-03-01",
        "ativo": True,
        "email": "juliana.rodrigues@workflowpro.com",
        "telefone": "(11) 98765-4328"
    }
]


async def seed_database():
    """Popula o banco de dados com dados de teste"""
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("🌱 Iniciando seed do banco de dados...")
    
    # Limpar dados existentes
    print("🗑️  Limpando dados existentes...")
    await db.funcionarios.delete_many({})
    await db.frequencia.delete_many({})
    
    # Inserir funcionários
    print("👥 Inserindo funcionários...")
    await db.funcionarios.insert_many(funcionarios_mock)
    print(f"✅ {len(funcionarios_mock)} funcionários inseridos")
    
    # Gerar registros de frequência dos últimos 30 dias
    print("📅 Gerando registros de frequência...")
    hoje = datetime.now()
    registros_frequencia = []
    
    for dia in range(30):
        data = hoje - timedelta(days=dia)
        data_str = data.strftime("%Y-%m-%d")
        
        # Apenas dias úteis (segunda a sexta)
        if data.weekday() < 5:
            for func in funcionarios_mock:
                # 90% de chance de estar presente
                if random.random() < 0.9:
                    hora_entrada = f"{random.randint(7, 9):02d}:{random.choice(['00', '15', '30', '45'])}"
                    hora_saida = f"{random.randint(17, 19):02d}:{random.choice(['00', '15', '30', '45'])}"
                    
                    # Calcular horas
                    entrada = datetime.strptime(hora_entrada, "%H:%M")
                    saida = datetime.strptime(hora_saida, "%H:%M")
                    total_horas = round((saida - entrada).total_seconds() / 3600, 2)
                    
                    registro = {
                        "id": f"freq-{func['id']}-{data_str}",
                        "funcionario_id": func['id'],
                        "nome": func['nome'],
                        "data": data_str,
                        "hora_entrada": hora_entrada,
                        "hora_saida": hora_saida,
                        "total_horas": total_horas,
                        "tipo_dia": "util"
                    }
                    registros_frequencia.append(registro)
    
    if registros_frequencia:
        await db.frequencia.insert_many(registros_frequencia)
        print(f"✅ {len(registros_frequencia)} registros de frequência inseridos")
    
    print("🎉 Seed concluído com sucesso!")
    
    # Estatísticas
    total_funcionarios = await db.funcionarios.count_documents({})
    total_frequencia = await db.frequencia.count_documents({})
    
    print("\n📊 Estatísticas:")
    print(f"   Funcionários: {total_funcionarios}")
    print(f"   Registros de frequência: {total_frequencia}")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(seed_database())
