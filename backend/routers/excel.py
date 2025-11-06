from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Request
from fastapi.responses import StreamingResponse
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
import logging

from services.funcionario_service import FuncionarioService
from services.frequencia_service import FrequenciaService
from services.excel_service import ExcelService
from models.funcionario import FuncionarioCreate

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/excel", tags=["Excel"])


def get_database(request: Request):
    return request.app.state.db


@router.get("/funcionarios/export")
async def export_funcionarios(db: AsyncIOMotorDatabase = Depends(get_database)):
    """
    Exporta todos os funcionários para arquivo Excel
    """
    try:
        funcionario_service = FuncionarioService(db)
        funcionarios = await funcionario_service.get_all()
        
        # Converte para dicionários
        funcionarios_dict = [func.model_dump() for func in funcionarios]
        
        # Gera Excel
        excel_buffer = ExcelService.export_funcionarios_to_excel(funcionarios_dict)
        
        # Retorna como download
        return StreamingResponse(
            excel_buffer,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f"attachment; filename=funcionarios_{pd.Timestamp.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
            }
        )
        
    except Exception as e:
        logger.error(f"Erro ao exportar funcionários: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/funcionarios/import")
async def import_funcionarios(
    file: UploadFile = File(...),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Importa funcionários de arquivo Excel
    
    Formato esperado:
    - Planilha "Funcionários" com colunas: Nome, CPF, Cargo, Setor, Data Admissão, Telefone, Email, Ativo
    """
    try:
        # Valida tipo de arquivo
        if not file.filename.endswith(('.xlsx', '.xls')):
            raise HTTPException(status_code=400, detail="Arquivo deve ser .xlsx ou .xls")
        
        # Lê conteúdo do arquivo
        content = await file.read()
        
        # Importa dados do Excel
        funcionarios_data = ExcelService.import_funcionarios_from_excel(content)
        
        # Salva funcionários no banco
        funcionario_service = FuncionarioService(db)
        
        created = []
        errors = []
        
        for func_data in funcionarios_data:
            try:
                funcionario_create = FuncionarioCreate(**func_data)
                funcionario = await funcionario_service.create(funcionario_create)
                created.append(funcionario.model_dump())
            except Exception as e:
                errors.append({
                    'funcionario': func_data.get('nome', 'Desconhecido'),
                    'erro': str(e)
                })
        
        return {
            "message": f"Importação concluída",
            "total_processados": len(funcionarios_data),
            "criados": len(created),
            "erros": len(errors),
            "detalhes_erros": errors
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Erro ao importar funcionários: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/frequencia/export")
async def export_frequencia(
    data_inicio: str = None,
    data_fim: str = None,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Exporta registros de frequência para arquivo Excel
    
    Query params opcionais:
    - data_inicio: Filtro de data inicial (YYYY-MM-DD)
    - data_fim: Filtro de data final (YYYY-MM-DD)
    """
    try:
        frequencia_service = FrequenciaService(db)
        
        # Busca registros (com filtros se fornecidos)
        query = {}
        if data_inicio or data_fim:
            query["data"] = {}
            if data_inicio:
                query["data"]["$gte"] = data_inicio
            if data_fim:
                query["data"]["$lte"] = data_fim
        
        cursor = frequencia_service.collection.find(query).sort("data", -1)
        registros = await cursor.to_list(length=10000)
        
        # Gera Excel
        excel_buffer = ExcelService.export_frequencia_to_excel(registros)
        
        # Retorna como download
        import pandas as pd
        return StreamingResponse(
            excel_buffer,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f"attachment; filename=frequencia_{pd.Timestamp.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
            }
        )
        
    except Exception as e:
        logger.error(f"Erro ao exportar frequência: {e}")
        raise HTTPException(status_code=500, detail=str(e))
