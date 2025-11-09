"""
Endpoints adicionais para importação de planilhas Excel
Alimentação e Materiais
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Request
from fastapi.responses import StreamingResponse
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging
import pandas as pd
from io import BytesIO
from typing import List, Dict, Any

from services.excel_service import ExcelService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/excel", tags=["Excel - Importação"])


def get_database(request: Request):
    return request.app.state.db


@router.post("/frequencia/import")
async def import_frequencia(
    file: UploadFile = File(...),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Importa registros de frequência de arquivo Excel
    
    Formato esperado:
    - Colunas: Funcionário ID, Data, Hora Entrada, Hora Saída, Tipo Dia, Observações
    """
    try:
        if not file.filename.endswith(('.xlsx', '.xls', '.csv')):
            raise HTTPException(status_code=400, detail="Arquivo deve ser .xlsx, .xls ou .csv")
        
        content = await file.read()
        
        # Lê o arquivo
        if file.filename.endswith('.csv'):
            df = pd.read_csv(BytesIO(content))
        else:
            df = pd.read_excel(BytesIO(content))
        
        # Valida colunas obrigatórias
        required_columns = ['funcionario_id', 'data']
        for col in required_columns:
            if col not in df.columns:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Coluna obrigatória ausente: {col}"
                )
        
        created = []
        errors = []
        
        for idx, row in df.iterrows():
            try:
                registro = {
                    'funcionario_id': str(row['funcionario_id']),
                    'data': str(row['data']),
                    'hora_entrada': str(row.get('hora_entrada', '')),
                    'hora_saida': str(row.get('hora_saida', '')),
                    'tipo_dia': str(row.get('tipo_dia', 'util')),
                    'observacao': str(row.get('observacao', ''))
                }
                
                # Insere no banco
                result = await db.frequencia.insert_one(registro)
                created.append(str(result.inserted_id))
                
            except Exception as e:
                errors.append({
                    'linha': idx + 2,
                    'erro': str(e)
                })
        
        return {
            "message": "Importação concluída",
            "total_processados": len(df),
            "criados": len(created),
            "erros": len(errors),
            "detalhes_erros": errors
        }
        
    except Exception as e:
        logger.error(f"Erro ao importar frequência: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/alimentacao/export")
async def export_alimentacao(
    data_inicio: str = None,
    data_fim: str = None,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Exporta registros de alimentação para arquivo Excel
    """
    try:
        query = {}
        if data_inicio or data_fim:
            query["data"] = {}
            if data_inicio:
                query["data"]["$gte"] = data_inicio
            if data_fim:
                query["data"]["$lte"] = data_fim
        
        cursor = db.alimentacao.find(query).sort("data", -1)
        registros = await cursor.to_list(length=10000)
        
        # Converte para DataFrame
        df = pd.DataFrame(registros)
        if not df.empty:
            df = df.drop('_id', axis=1, errors='ignore')
        
        # Gera Excel
        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Alimentação', index=False)
        output.seek(0)
        
        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f"attachment; filename=alimentacao_{pd.Timestamp.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
            }
        )
        
    except Exception as e:
        logger.error(f"Erro ao exportar alimentação: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/alimentacao/import")
async def import_alimentacao(
    file: UploadFile = File(...),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Importa registros de alimentação de arquivo Excel
    
    Formato esperado:
    - Colunas: Funcionário ID, Nome, Data, Tipo Refeição, Valor Unitário, Quantidade, Fornecedor
    """
    try:
        if not file.filename.endswith(('.xlsx', '.xls', '.csv')):
            raise HTTPException(status_code=400, detail="Arquivo deve ser .xlsx, .xls ou .csv")
        
        content = await file.read()
        
        if file.filename.endswith('.csv'):
            df = pd.read_csv(BytesIO(content))
        else:
            df = pd.read_excel(BytesIO(content))
        
        required_columns = ['funcionario_id', 'data', 'tipo_refeicao']
        for col in required_columns:
            if col not in df.columns:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Coluna obrigatória ausente: {col}"
                )
        
        created = []
        errors = []
        
        for idx, row in df.iterrows():
            try:
                registro = {
                    'funcionario_id': str(row['funcionario_id']),
                    'nome': str(row.get('nome', '')),
                    'data': str(row['data']),
                    'tipo_refeicao': str(row['tipo_refeicao']),
                    'valor_unitario': float(row.get('valor_unitario', 0)),
                    'quantidade': int(row.get('quantidade', 1)),
                    'total_dia': float(row.get('valor_unitario', 0)) * int(row.get('quantidade', 1)),
                    'fornecedor': str(row.get('fornecedor', ''))
                }
                
                result = await db.alimentacao.insert_one(registro)
                created.append(str(result.inserted_id))
                
            except Exception as e:
                errors.append({
                    'linha': idx + 2,
                    'erro': str(e)
                })
        
        return {
            "message": "Importação concluída",
            "total_processados": len(df),
            "criados": len(created),
            "erros": len(errors),
            "detalhes_erros": errors
        }
        
    except Exception as e:
        logger.error(f"Erro ao importar alimentação: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/materiais/export")
async def export_materiais(
    data_inicio: str = None,
    data_fim: str = None,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Exporta registros de materiais para arquivo Excel
    """
    try:
        query = {}
        if data_inicio or data_fim:
            query["data"] = {}
            if data_inicio:
                query["data"]["$gte"] = data_inicio
            if data_fim:
                query["data"]["$lte"] = data_fim
        
        cursor = db.materiais.find(query).sort("data", -1)
        registros = await cursor.to_list(length=10000)
        
        df = pd.DataFrame(registros)
        if not df.empty:
            df = df.drop('_id', axis=1, errors='ignore')
        
        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Materiais', index=False)
        output.seek(0)
        
        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f"attachment; filename=materiais_{pd.Timestamp.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
            }
        )
        
    except Exception as e:
        logger.error(f"Erro ao exportar materiais: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/materiais/import")
async def import_materiais(
    file: UploadFile = File(...),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Importa registros de materiais de arquivo Excel
    
    Formato esperado:
    - Colunas: Data, Descrição, Local Uso, Categoria, Quantidade, Valor Unitário, Autorizado Por
    """
    try:
        if not file.filename.endswith(('.xlsx', '.xls', '.csv')):
            raise HTTPException(status_code=400, detail="Arquivo deve ser .xlsx, .xls ou .csv")
        
        content = await file.read()
        
        if file.filename.endswith('.csv'):
            df = pd.read_csv(BytesIO(content))
        else:
            df = pd.read_excel(BytesIO(content))
        
        required_columns = ['data', 'descricao', 'local_uso']
        for col in required_columns:
            if col not in df.columns:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Coluna obrigatória ausente: {col}"
                )
        
        created = []
        errors = []
        
        for idx, row in df.iterrows():
            try:
                quantidade = float(row.get('quantidade', 1))
                valor_unitario = float(row.get('valor_unitario', 0))
                
                registro = {
                    'data': str(row['data']),
                    'descricao': str(row['descricao']),
                    'local_uso': str(row['local_uso']),
                    'categoria': str(row.get('categoria', '')),
                    'quantidade': quantidade,
                    'valor_unitario': valor_unitario,
                    'valor_total': quantidade * valor_unitario,
                    'autorizado_por': str(row.get('autorizado_por', ''))
                }
                
                result = await db.materiais.insert_one(registro)
                created.append(str(result.inserted_id))
                
            except Exception as e:
                errors.append({
                    'linha': idx + 2,
                    'erro': str(e)
                })
        
        return {
            "message": "Importação concluída",
            "total_processados": len(df),
            "criados": len(created),
            "erros": len(errors),
            "detalhes_erros": errors
        }
        
    except Exception as e:
        logger.error(f"Erro ao importar materiais: {e}")
        raise HTTPException(status_code=500, detail=str(e))
