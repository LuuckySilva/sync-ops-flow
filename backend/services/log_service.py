"""
Serviço para gerenciamento de logs de auditoria
"""
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from typing import List, Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)


class LogService:
    """Serviço de logs de auditoria"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.logs
    
    async def create_log(
        self,
        usuario_email: str,
        usuario_nome: str,
        acao: str,
        tipo: str,
        status: str,
        modulo: Optional[str] = None,
        detalhes: Optional[Dict[str, Any]] = None,
        ip_origem: Optional[str] = None
    ) -> str:
        """
        Cria um registro de log
        
        Args:
            usuario_email: Email do usuário
            usuario_nome: Nome do usuário
            acao: Descrição da ação
            tipo: Tipo de ação (login, import, export, create, update, delete)
            status: Status da operação (sucesso, erro)
            modulo: Módulo afetado (opcional)
            detalhes: Detalhes adicionais (opcional)
            ip_origem: IP de origem (opcional)
            
        Returns:
            ID do log criado
        """
        try:
            log_data = {
                "usuario_email": usuario_email,
                "usuario_nome": usuario_nome,
                "acao": acao,
                "tipo": tipo,
                "modulo": modulo,
                "status": status,
                "detalhes": detalhes or {},
                "ip_origem": ip_origem,
                "data_hora": datetime.utcnow()
            }
            
            result = await self.collection.insert_one(log_data)
            logger.info(f"Log criado: {acao} - {status}")
            
            return str(result.inserted_id)
            
        except Exception as e:
            logger.error(f"Erro ao criar log: {e}")
            # Não falha a operação principal se houver erro no log
            return None
    
    async def get_logs(
        self,
        usuario_email: Optional[str] = None,
        tipo: Optional[str] = None,
        modulo: Optional[str] = None,
        status: Optional[str] = None,
        data_inicio: Optional[datetime] = None,
        data_fim: Optional[datetime] = None,
        limite: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Busca logs com filtros
        
        Args:
            usuario_email: Filtrar por email do usuário
            tipo: Filtrar por tipo de ação
            modulo: Filtrar por módulo
            status: Filtrar por status
            data_inicio: Data inicial
            data_fim: Data final
            limite: Limite de registros
            
        Returns:
            Lista de logs
        """
        try:
            query = {}
            
            if usuario_email:
                query["usuario_email"] = usuario_email
            
            if tipo:
                query["tipo"] = tipo
            
            if modulo:
                query["modulo"] = modulo
            
            if status:
                query["status"] = status
            
            if data_inicio or data_fim:
                query["data_hora"] = {}
                if data_inicio:
                    query["data_hora"]["$gte"] = data_inicio
                if data_fim:
                    query["data_hora"]["$lte"] = data_fim
            
            cursor = self.collection.find(query).sort("data_hora", -1).limit(limite)
            logs = await cursor.to_list(length=limite)
            
            # Converte ObjectId para string
            for log in logs:
                log["id"] = str(log.pop("_id"))
            
            return logs
            
        except Exception as e:
            logger.error(f"Erro ao buscar logs: {e}")
            return []
    
    async def get_recent_logs(self, limite: int = 50) -> List[Dict[str, Any]]:
        """
        Busca os logs mais recentes
        
        Args:
            limite: Número de logs a retornar
            
        Returns:
            Lista de logs
        """
        return await self.get_logs(limite=limite)
    
    async def get_user_logs(self, usuario_email: str, limite: int = 100) -> List[Dict[str, Any]]:
        """
        Busca logs de um usuário específico
        
        Args:
            usuario_email: Email do usuário
            limite: Limite de registros
            
        Returns:
            Lista de logs do usuário
        """
        return await self.get_logs(usuario_email=usuario_email, limite=limite)
    
    async def get_logs_stats(self) -> Dict[str, Any]:
        """
        Retorna estatísticas de logs
        
        Returns:
            Dicionário com estatísticas
        """
        try:
            total = await self.collection.count_documents({})
            
            # Logs por tipo
            pipeline_tipo = [
                {"$group": {"_id": "$tipo", "count": {"$sum": 1}}}
            ]
            tipos = await self.collection.aggregate(pipeline_tipo).to_list(length=None)
            
            # Logs por status
            pipeline_status = [
                {"$group": {"_id": "$status", "count": {"$sum": 1}}}
            ]
            status = await self.collection.aggregate(pipeline_status).to_list(length=None)
            
            return {
                "total": total,
                "por_tipo": {item["_id"]: item["count"] for item in tipos},
                "por_status": {item["_id"]: item["count"] for item in status}
            }
            
        except Exception as e:
            logger.error(f"Erro ao obter estatísticas de logs: {e}")
            return {"total": 0, "por_tipo": {}, "por_status": {}}
