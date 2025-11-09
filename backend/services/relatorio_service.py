from motor.motor_asyncio import AsyncIOMotorDatabase
from models.relatorio import RelatorioRequest, RelatorioResponse
from services.frequencia_service import FrequenciaService
from services.funcionario_service import FuncionarioService
from typing import Dict, Any, List
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class RelatorioService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.frequencia_service = FrequenciaService(db)
        self.funcionario_service = FuncionarioService(db)

    async def gerar_relatorio(self, request: RelatorioRequest) -> RelatorioResponse:
        """Gera relatório baseado nos parâmetros"""
        if request.tipo == "frequencia":
            return await self._relatorio_frequencia(request)
        elif request.tipo == "geral":
            return await self._relatorio_geral(request)
        else:
            # Outros tipos serão implementados nas próximas fases
            raise NotImplementedError(f"Relatório do tipo '{request.tipo}' ainda não implementado")

    async def _relatorio_frequencia(self, request: RelatorioRequest) -> RelatorioResponse:
        """Gera relatório de frequência"""
        # Busca registros
        registros = await self.frequencia_service.get_all(
            data_inicio=request.data_inicio,
            data_fim=request.data_fim,
            funcionario_id=request.funcionario_id
        )
        
        # Filtra por setor se necessário
        if request.setor:
            funcionarios_setor = await self.funcionario_service.get_all(setor=request.setor)
            ids_setor = {f.id for f in funcionarios_setor}
            registros = [r for r in registros if r.funcionario_id in ids_setor]
        
        # Calcula totalizadores
        total_horas = sum(r.total_horas or 0 for r in registros)
        total_registros = len(registros)
        
        # Agrupa por funcionário
        por_funcionario: Dict[str, Dict[str, Any]] = {}
        for registro in registros:
            if registro.funcionario_id not in por_funcionario:
                por_funcionario[registro.funcionario_id] = {
                    "funcionario_id": registro.funcionario_id,
                    "nome": registro.nome,
                    "total_registros": 0,
                    "total_horas": 0,
                    "dias_trabalhados": 0
                }
            
            por_funcionario[registro.funcionario_id]["total_registros"] += 1
            por_funcionario[registro.funcionario_id]["total_horas"] += registro.total_horas or 0
            if registro.hora_entrada and registro.hora_saida:
                por_funcionario[registro.funcionario_id]["dias_trabalhados"] += 1
        
        return RelatorioResponse(
            tipo="frequencia",
            periodo={
                "data_inicio": request.data_inicio,
                "data_fim": request.data_fim
            },
            dados=list(por_funcionario.values()),
            totalizadores={
                "total_registros": total_registros,
                "total_horas": round(total_horas, 2),
                "total_funcionarios": len(por_funcionario)
            },
            gerado_em=datetime.utcnow().isoformat()
        )

    async def _relatorio_geral(self, request: RelatorioRequest) -> RelatorioResponse:
        """Gera relatório geral com resumo de todas as áreas"""
        # Busca dados de frequência
        registros_freq = await self.frequencia_service.get_all(
            data_inicio=request.data_inicio,
            data_fim=request.data_fim
        )
        
        # Busca todos os funcionários ativos
        funcionarios = await self.funcionario_service.get_all(ativo=True)
        
        # Filtra por setor se necessário
        if request.setor:
            funcionarios = [f for f in funcionarios if f.setor == request.setor]
        
        total_horas_trabalhadas = sum(r.total_horas or 0 for r in registros_freq)
        
        return RelatorioResponse(
            tipo="geral",
            periodo={
                "data_inicio": request.data_inicio,
                "data_fim": request.data_fim
            },
            dados=[
                {
                    "categoria": "Funcionários",
                    "total_ativos": len(funcionarios),
                    "por_setor": self._agrupar_por_setor(funcionarios)
                },
                {
                    "categoria": "Frequência",
                    "total_registros": len(registros_freq),
                    "total_horas": round(total_horas_trabalhadas, 2)
                }
            ],
            totalizadores={
                "funcionarios_ativos": len(funcionarios),
                "total_horas_periodo": round(total_horas_trabalhadas, 2)
            },
            gerado_em=datetime.utcnow().isoformat()
        )

    def _agrupar_por_setor(self, funcionarios) -> Dict[str, int]:
        """Agrupa funcionários por setor"""
        setores: Dict[str, int] = {}
        for func in funcionarios:
            setores[func.setor] = setores.get(func.setor, 0) + 1
        return setores
