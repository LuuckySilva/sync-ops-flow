from motor.motor_asyncio import AsyncIOMotorDatabase
from models.funcionario import Funcionario, FuncionarioCreate, FuncionarioUpdate
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)


class FuncionarioService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.funcionarios

    async def create(self, funcionario_data: FuncionarioCreate) -> Funcionario:
        """Cria um novo funcionário"""
        # Verifica se CPF já existe
        existing = await self.collection.find_one({"cpf": funcionario_data.cpf})
        if existing:
            raise ValueError(f"Funcionário com CPF {funcionario_data.cpf} já existe")
        
        funcionario = Funcionario(**funcionario_data.model_dump())
        await self.collection.insert_one(funcionario.model_dump())
        logger.info(f"Funcionário criado: {funcionario.id} - {funcionario.nome}")
        return funcionario

    async def get_all(self, ativo: Optional[bool] = None, setor: Optional[str] = None) -> List[Funcionario]:
        """Lista todos os funcionários com filtros opcionais"""
        query = {}
        if ativo is not None:
            query["ativo"] = ativo
        if setor:
            query["setor"] = setor
        
        cursor = self.collection.find(query).sort("nome", 1)
        funcionarios = await cursor.to_list(length=1000)
        return [Funcionario(**func) for func in funcionarios]

    async def get_by_id(self, funcionario_id: str) -> Optional[Funcionario]:
        """Busca funcionário por ID"""
        doc = await self.collection.find_one({"id": funcionario_id})
        if doc:
            return Funcionario(**doc)
        return None

    async def update(self, funcionario_id: str, update_data: FuncionarioUpdate) -> Optional[Funcionario]:
        """Atualiza um funcionário"""
        # Remove campos None do update
        update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
        
        if not update_dict:
            return await self.get_by_id(funcionario_id)
        
        # Verifica se CPF já existe em outro funcionário
        if "cpf" in update_dict:
            existing = await self.collection.find_one({
                "cpf": update_dict["cpf"],
                "id": {"$ne": funcionario_id}
            })
            if existing:
                raise ValueError(f"CPF {update_dict['cpf']} já está em uso")
        
        result = await self.collection.update_one(
            {"id": funcionario_id},
            {"$set": update_dict}
        )
        
        if result.modified_count > 0:
            logger.info(f"Funcionário atualizado: {funcionario_id}")
            return await self.get_by_id(funcionario_id)
        
        return None

    async def delete(self, funcionario_id: str) -> bool:
        """Remove um funcionário (soft delete - marca como inativo)"""
        result = await self.collection.update_one(
            {"id": funcionario_id},
            {"$set": {"ativo": False}}
        )
        if result.modified_count > 0:
            logger.info(f"Funcionário desativado: {funcionario_id}")
            return True
        return False

    async def get_by_cpf(self, cpf: str) -> Optional[Funcionario]:
        """Busca funcionário por CPF"""
        doc = await self.collection.find_one({"cpf": cpf})
        if doc:
            return Funcionario(**doc)
        return None
