from motor.motor_asyncio import AsyncIOMotorDatabase
from models.frequencia import RegistroFrequencia, RegistroFrequenciaCreate, RegistroFrequenciaUpdate
from services.funcionario_service import FuncionarioService
from typing import List, Optional
from datetime import datetime, time
import logging

logger = logging.getLogger(__name__)


class FrequenciaService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.frequencia
        self.funcionario_service = FuncionarioService(db)

    def _calcular_horas(self, hora_entrada: Optional[str], hora_saida: Optional[str]) -> Optional[float]:
        """Calcula total de horas trabalhadas"""
        if not hora_entrada or not hora_saida:
            return None
        
        try:
            entrada = datetime.strptime(hora_entrada, "%H:%M")
            saida = datetime.strptime(hora_saida, "%H:%M")
            delta = saida - entrada
            return round(delta.total_seconds() / 3600, 2)
        except ValueError:
            return None

    async def create(self, registro_data: RegistroFrequenciaCreate) -> RegistroFrequencia:
        """Registra frequência de um funcionário"""
        # Verifica se funcionário existe
        funcionario = await self.funcionario_service.get_by_id(registro_data.funcionario_id)
        if not funcionario:
            raise ValueError(f"Funcionário {registro_data.funcionario_id} não encontrado")
        
        # Verifica se já existe registro para esta data
        existing = await self.collection.find_one({
            "funcionario_id": registro_data.funcionario_id,
            "data": registro_data.data
        })
        if existing:
            raise ValueError(f"Já existe registro de frequência para {funcionario.nome} em {registro_data.data}")
        
        # Calcula total de horas
        total_horas = self._calcular_horas(registro_data.hora_entrada, registro_data.hora_saida)
        
        registro = RegistroFrequencia(
            **registro_data.model_dump(),
            nome=funcionario.nome,
            total_horas=total_horas
        )
        
        await self.collection.insert_one(registro.model_dump())
        logger.info(f"Frequência registrada: {funcionario.nome} - {registro_data.data}")
        return registro

    async def get_all(
        self,
        data_inicio: Optional[str] = None,
        data_fim: Optional[str] = None,
        funcionario_id: Optional[str] = None
    ) -> List[RegistroFrequencia]:
        """Lista registros de frequência com filtros"""
        query = {}
        
        if funcionario_id:
            query["funcionario_id"] = funcionario_id
        
        if data_inicio and data_fim:
            query["data"] = {"$gte": data_inicio, "$lte": data_fim}
        elif data_inicio:
            query["data"] = {"$gte": data_inicio}
        elif data_fim:
            query["data"] = {"$lte": data_fim}
        
        cursor = self.collection.find(query).sort("data", -1)
        registros = await cursor.to_list(length=5000)
        return [RegistroFrequencia(**reg) for reg in registros]

    async def get_by_id(self, registro_id: str) -> Optional[RegistroFrequencia]:
        """Busca registro por ID"""
        doc = await self.collection.find_one({"id": registro_id})
        if doc:
            return RegistroFrequencia(**doc)
        return None

    async def update(self, registro_id: str, update_data: RegistroFrequenciaUpdate) -> Optional[RegistroFrequencia]:
        """Atualiza um registro de frequência"""
        # Remove campos None
        update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
        
        if not update_dict:
            return await self.get_by_id(registro_id)
        
        # Busca registro atual
        registro_atual = await self.get_by_id(registro_id)
        if not registro_atual:
            return None
        
        # Recalcula horas se entrada ou saída mudaram
        hora_entrada = update_dict.get("hora_entrada", registro_atual.hora_entrada)
        hora_saida = update_dict.get("hora_saida", registro_atual.hora_saida)
        
        if "hora_entrada" in update_dict or "hora_saida" in update_dict:
            update_dict["total_horas"] = self._calcular_horas(hora_entrada, hora_saida)
        
        result = await self.collection.update_one(
            {"id": registro_id},
            {"$set": update_dict}
        )
        
        if result.modified_count > 0:
            logger.info(f"Frequência atualizada: {registro_id}")
            return await self.get_by_id(registro_id)
        
        return None

    async def delete(self, registro_id: str) -> bool:
        """Remove um registro de frequência"""
        result = await self.collection.delete_one({"id": registro_id})
        if result.deleted_count > 0:
            logger.info(f"Frequência removida: {registro_id}")
            return True
        return False

    async def get_by_funcionario_mes(self, funcionario_id: str, ano: int, mes: int) -> List[RegistroFrequencia]:
        """Busca todos os registros de um funcionário em um mês específico"""
        data_inicio = f"{ano}-{mes:02d}-01"
        # Calcula último dia do mês
        if mes == 12:
            data_fim = f"{ano}-12-31"
        else:
            data_fim = f"{ano}-{mes+1:02d}-01"
        
        return await self.get_all(
            data_inicio=data_inicio,
            data_fim=data_fim,
            funcionario_id=funcionario_id
        )
