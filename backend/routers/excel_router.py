"""
Router otimizado para importação e exportação de planilhas Excel/CSV
Sistema Sync Ops Flow - Gestão Interna

Endpoints disponíveis:
- POST /api/excel/frequencia/import
- GET  /api/excel/frequencia/export
- POST /api/excel/alimentacao/import
- GET  /api/excel/alimentacao/export
- POST /api/excel/materiais/import
- GET  /api/excel/materiais/export
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Request, Query
from fastapi.responses import StreamingResponse
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Dict, Any, Optional
from datetime import datetime
from io import BytesIO
import logging
import pandas as pd
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment

from auth.dependencies import get_current_active_user
from dependencies import get_database
from services.log_service import LogService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/excel", tags=["Excel - Importação/Exportação"])


def get_client_ip(request: Request) -> str:
    """Obtém o IP do cliente"""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0]
    return request.client.host if request.client else "unknown"


# ============================================================================
# FUNÇÕES AUXILIARES - VALIDAÇÃO E LEITURA
# ============================================================================

def normalize_column_name(col: str) -> str:
    """
    Normaliza nome de coluna para facilitar mapeamento
    Remove acentos, espaços extras e converte para minúsculas
    """
    import unicodedata
    # Remove acentos
    nfkd = unicodedata.normalize('NFKD', str(col))
    col_normalized = ''.join([c for c in nfkd if not unicodedata.combining(c)])
    # Remove espaços extras e converte para minúsculas
    return col_normalized.strip().lower().replace(' ', '_')


def map_columns(df: pd.DataFrame, column_mapping: Dict[str, List[str]]) -> pd.DataFrame:
    """
    Mapeia colunas do DataFrame para nomes padronizados
    Aceita variações de nomes de colunas
    
    Args:
        df: DataFrame original
        column_mapping: Dicionário com nome_padrao -> [variações aceitas]
    
    Returns:
        DataFrame com colunas renomeadas
    """
    # Normaliza nomes das colunas do DataFrame
    normalized_cols = {col: normalize_column_name(col) for col in df.columns}
    
    # Cria mapeamento reverso
    rename_map = {}
    for standard_name, variations in column_mapping.items():
        for variation in variations:
            normalized_variation = normalize_column_name(variation)
            for original_col, normalized_col in normalized_cols.items():
                if normalized_col == normalized_variation:
                    rename_map[original_col] = standard_name
                    break
    
    return df.rename(columns=rename_map)


def read_file_to_dataframe(content: bytes, filename: str) -> pd.DataFrame:
    """
    Lê arquivo Excel ou CSV e retorna DataFrame
    Suporta diferentes encodings para CSV
    
    Args:
        content: Conteúdo do arquivo em bytes
        filename: Nome do arquivo (para detectar extensão)
    
    Returns:
        DataFrame com dados do arquivo
    """
    try:
        if filename.endswith('.csv'):
            # Tenta diferentes encodings para CSV
            encodings = ['utf-8', 'iso-8859-1', 'latin1', 'cp1252']
            for encoding in encodings:
                try:
                    df = pd.read_csv(BytesIO(content), encoding=encoding)
                    logger.info(f"CSV lido com encoding: {encoding}")
                    return df
                except UnicodeDecodeError:
                    continue
            raise ValueError("Não foi possível ler o arquivo CSV com os encodings suportados")
        
        elif filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(BytesIO(content))
            logger.info(f"Excel lido com sucesso: {len(df)} linhas")
            return df
        
        else:
            raise ValueError(f"Formato de arquivo não suportado: {filename}")
    
    except Exception as e:
        logger.error(f"Erro ao ler arquivo {filename}: {e}")
        raise ValueError(f"Erro ao processar arquivo: {str(e)}")


def validate_required_columns(df: pd.DataFrame, required_cols: List[str]) -> None:
    """
    Valida se todas as colunas obrigatórias estão presentes
    
    Args:
        df: DataFrame a validar
        required_cols: Lista de colunas obrigatórias
    
    Raises:
        HTTPException: Se alguma coluna obrigatória estiver ausente
    """
    missing = [col for col in required_cols if col not in df.columns]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Colunas obrigatórias ausentes: {', '.join(missing)}"
        )


def clean_and_format_value(value: Any, field_type: str = "string") -> Any:
    """
    Limpa e formata valores de acordo com o tipo
    
    Args:
        value: Valor a ser limpo
        field_type: Tipo do campo (string, float, int, date)
    
    Returns:
        Valor limpo e formatado
    """
    if pd.isna(value) or value == '' or value is None:
        return None if field_type != "string" else ""
    
    if field_type == "string":
        return str(value).strip()
    
    elif field_type == "float":
        try:
            # Remove símbolos de moeda e converte
            value_str = str(value).replace('R$', '').replace(',', '.').strip()
            return float(value_str)
        except:
            return 0.0
    
    elif field_type == "int":
        try:
            return int(float(value))
        except:
            return 0
    
    elif field_type == "date":
        try:
            if isinstance(value, datetime):
                return value.strftime('%Y-%m-%d')
            return str(value).split()[0]  # Remove hora se existir
        except:
            return str(value)
    
    return value


# ============================================================================
# FUNÇÕES AUXILIARES - EXPORTAÇÃO
# ============================================================================

def create_excel_from_dataframe(df: pd.DataFrame, sheet_name: str) -> BytesIO:
    """
    Cria arquivo Excel formatado a partir de DataFrame
    
    Args:
        df: DataFrame com dados
        sheet_name: Nome da planilha
    
    Returns:
        BytesIO com arquivo Excel
    """
    output = BytesIO()
    
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name=sheet_name, index=False)
        
        # Acessa o workbook e worksheet para formatação
        workbook = writer.book
        worksheet = writer.sheets[sheet_name]
        
        # Estilo do cabeçalho
        header_fill = PatternFill(start_color="1F4788", end_color="1F4788", fill_type="solid")
        header_font = Font(bold=True, color="FFFFFF", size=11)
        
        # Aplica formatação ao cabeçalho
        for cell in worksheet[1]:
            cell.fill = header_fill
            cell.font = header_font
            cell.alignment = Alignment(horizontal="center", vertical="center")
        
        # Ajusta largura das colunas
        for column in worksheet.columns:
            max_length = 0
            column_letter = column[0].column_letter
            
            for cell in column:
                try:
                    if cell.value:
                        max_length = max(max_length, len(str(cell.value)))
                except:
                    pass
            
            adjusted_width = min(max_length + 3, 50)
            worksheet.column_dimensions[column_letter].width = adjusted_width
    
    output.seek(0)
    return output


# ============================================================================
# ENDPOINTS - FREQUÊNCIA
# ============================================================================

@router.post("/frequencia/import")
async def import_frequencia(
    file: UploadFile = File(...),
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict = Depends(get_current_active_user)
):
    """
    Importa registros de frequência de arquivo Excel/CSV
    
    Colunas obrigatórias:
    - funcionario_id: ID do funcionário
    - data: Data do registro (YYYY-MM-DD ou DD/MM/YYYY)
    
    Colunas opcionais:
    - hora_entrada: Horário de entrada (HH:MM)
    - hora_saida: Horário de saída (HH:MM)
    - tipo_dia: Tipo de dia (util, feriado, domingo)
    - observacao: Observações
    """
    try:
        # Valida tipo de arquivo
        if not file.filename.endswith(('.xlsx', '.xls', '.csv')):
            raise HTTPException(
                status_code=400,
                detail="Arquivo deve ser .xlsx, .xls ou .csv"
            )
        
        # Lê arquivo
        content = await file.read()
        df = read_file_to_dataframe(content, file.filename)
        
        # Mapeia colunas com variações aceitas
        column_mapping = {
            'funcionario_id': ['funcionario_id', 'funcionarioid', 'id_funcionario', 'funcionario', 'id'],
            'data': ['data', 'date', 'dia'],
            'hora_entrada': ['hora_entrada', 'horaentrada', 'entrada', 'checkin'],
            'hora_saida': ['hora_saida', 'horasaida', 'saida', 'checkout'],
            'tipo_dia': ['tipo_dia', 'tipodia', 'tipo'],
            'observacao': ['observacao', 'observacoes', 'obs', 'notas']
        }
        
        df = map_columns(df, column_mapping)
        
        # Valida colunas obrigatórias
        validate_required_columns(df, ['funcionario_id', 'data'])
        
        # Processa e insere registros
        created = []
        errors = []
        
        for idx, row in df.iterrows():
            try:
                # Limpa e formata dados
                registro = {
                    'funcionario_id': clean_and_format_value(row['funcionario_id'], 'string'),
                    'data': clean_and_format_value(row['data'], 'date'),
                    'hora_entrada': clean_and_format_value(row.get('hora_entrada', ''), 'string'),
                    'hora_saida': clean_and_format_value(row.get('hora_saida', ''), 'string'),
                    'tipo_dia': clean_and_format_value(row.get('tipo_dia', 'util'), 'string'),
                    'observacao': clean_and_format_value(row.get('observacao', ''), 'string'),
                    'importado_em': datetime.now().isoformat()
                }
                
                # Pula linhas vazias
                if not registro['funcionario_id'] or not registro['data']:
                    continue
                
                # Calcula horas trabalhadas se entrada e saída fornecidas
                if registro['hora_entrada'] and registro['hora_saida']:
                    try:
                        entrada = datetime.strptime(registro['hora_entrada'], '%H:%M')
                        saida = datetime.strptime(registro['hora_saida'], '%H:%M')
                        horas_trabalhadas = (saida - entrada).seconds / 3600
                        registro['horas_trabalhadas'] = round(horas_trabalhadas, 2)
                    except:
                        registro['horas_trabalhadas'] = 0
                
                # Insere no banco
                result = await db.frequencia.insert_one(registro)
                created.append(str(result.inserted_id))
                
            except Exception as e:
                errors.append({
                    'linha': idx + 2,
                    'dados': row.to_dict(),
                    'erro': str(e)
                })
        
        logger.info(f"Frequência importada: {len(created)} criados, {len(errors)} erros")
        
        # Registra no log de auditoria
        log_service = LogService(db)
        await log_service.create_log(
            usuario_email=current_user["email"],
            usuario_nome=current_user["nome"],
            acao=f"Importação de frequência via {file.filename}",
            tipo="import",
            modulo="frequencia",
            status="sucesso",
            detalhes={
                "arquivo": file.filename,
                "total_processados": len(df),
                "criados": len(created),
                "erros": len(errors)
            },
            ip_origem=get_client_ip(request)
        )
        
        return {
            "message": "Importação de frequência concluída",
            "total_processados": len(df),
            "criados": len(created),
            "erros": len(errors),
            "detalhes_erros": errors[:10]  # Limita a 10 erros para não sobrecarregar resposta
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao importar frequência: {e}")
        
        # Registra erro no log
        log_service = LogService(db)
        await log_service.create_log(
            usuario_email=current_user.get("email", "unknown"),
            usuario_nome=current_user.get("nome", "Unknown"),
            acao=f"Tentativa de importação de frequência via {file.filename}",
            tipo="import",
            modulo="frequencia",
            status="erro",
            detalhes={"erro": str(e), "arquivo": file.filename},
            ip_origem=get_client_ip(request)
        )
        
        raise HTTPException(status_code=500, detail=f"Erro ao processar importação: {str(e)}")


@router.get("/frequencia/export")
async def export_frequencia(
    data_inicio: Optional[str] = Query(None, description="Data inicial (YYYY-MM-DD)"),
    data_fim: Optional[str] = Query(None, description="Data final (YYYY-MM-DD)"),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Exporta registros de frequência para arquivo Excel
    
    Query params opcionais:
    - data_inicio: Filtro de data inicial (YYYY-MM-DD)
    - data_fim: Filtro de data final (YYYY-MM-DD)
    """
    try:
        # Monta query de filtro
        query = {}
        if data_inicio or data_fim:
            query["data"] = {}
            if data_inicio:
                query["data"]["$gte"] = data_inicio
            if data_fim:
                query["data"]["$lte"] = data_fim
        
        # Busca registros
        cursor = db.frequencia.find(query).sort("data", -1)
        registros = await cursor.to_list(length=10000)
        
        if not registros:
            raise HTTPException(status_code=404, detail="Nenhum registro encontrado")
        
        # Converte para DataFrame
        df = pd.DataFrame(registros)
        
        # Remove campos técnicos
        df = df.drop(['_id', 'importado_em'], axis=1, errors='ignore')
        
        # Reordena e renomeia colunas
        column_order = ['funcionario_id', 'data', 'hora_entrada', 'hora_saida', 
                       'horas_trabalhadas', 'tipo_dia', 'observacao']
        df = df.reindex(columns=[col for col in column_order if col in df.columns])
        
        # Renomeia para português
        df = df.rename(columns={
            'funcionario_id': 'Funcionário ID',
            'data': 'Data',
            'hora_entrada': 'Hora Entrada',
            'hora_saida': 'Hora Saída',
            'horas_trabalhadas': 'Horas Trabalhadas',
            'tipo_dia': 'Tipo Dia',
            'observacao': 'Observação'
        })
        
        # Gera Excel
        excel_buffer = create_excel_from_dataframe(df, 'Frequência')
        
        # Gera nome do arquivo
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"frequencia_{timestamp}.xlsx"
        
        logger.info(f"Exportados {len(registros)} registros de frequência")
        
        return StreamingResponse(
            excel_buffer,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao exportar frequência: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao gerar exportação: {str(e)}")


# ============================================================================
# ENDPOINTS - ALIMENTAÇÃO
# ============================================================================

@router.post("/alimentacao/import")
async def import_alimentacao(
    file: UploadFile = File(...),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Importa registros de alimentação de arquivo Excel/CSV
    
    Colunas obrigatórias:
    - funcionario_id: ID do funcionário
    - data: Data da refeição
    - tipo_refeicao: Tipo (café, almoço, jantar)
    
    Colunas opcionais:
    - nome: Nome do funcionário
    - valor_unitario: Valor unitário da refeição
    - quantidade: Quantidade de refeições
    - fornecedor: Nome do fornecedor
    """
    try:
        if not file.filename.endswith(('.xlsx', '.xls', '.csv')):
            raise HTTPException(status_code=400, detail="Arquivo deve ser .xlsx, .xls ou .csv")
        
        content = await file.read()
        df = read_file_to_dataframe(content, file.filename)
        
        # Mapeia colunas
        column_mapping = {
            'funcionario_id': ['funcionario_id', 'funcionarioid', 'id_funcionario', 'id'],
            'nome': ['nome', 'name', 'funcionario_nome'],
            'data': ['data', 'date', 'dia'],
            'tipo_refeicao': ['tipo_refeicao', 'tiporefeicao', 'tipo', 'refeicao'],
            'valor_unitario': ['valor_unitario', 'valorunitario', 'valor', 'preco'],
            'quantidade': ['quantidade', 'qtd', 'qty'],
            'fornecedor': ['fornecedor', 'supplier', 'empresa']
        }
        
        df = map_columns(df, column_mapping)
        validate_required_columns(df, ['funcionario_id', 'data', 'tipo_refeicao'])
        
        created = []
        errors = []
        
        for idx, row in df.iterrows():
            try:
                valor_unitario = clean_and_format_value(row.get('valor_unitario', 0), 'float')
                quantidade = clean_and_format_value(row.get('quantidade', 1), 'int')
                
                registro = {
                    'funcionario_id': clean_and_format_value(row['funcionario_id'], 'string'),
                    'nome': clean_and_format_value(row.get('nome', ''), 'string'),
                    'data': clean_and_format_value(row['data'], 'date'),
                    'tipo_refeicao': clean_and_format_value(row['tipo_refeicao'], 'string'),
                    'valor_unitario': valor_unitario,
                    'quantidade': quantidade,
                    'total_dia': round(valor_unitario * quantidade, 2),
                    'fornecedor': clean_and_format_value(row.get('fornecedor', ''), 'string'),
                    'importado_em': datetime.now().isoformat()
                }
                
                if not registro['funcionario_id'] or not registro['data']:
                    continue
                
                result = await db.alimentacao.insert_one(registro)
                created.append(str(result.inserted_id))
                
            except Exception as e:
                errors.append({'linha': idx + 2, 'erro': str(e)})
        
        logger.info(f"Alimentação importada: {len(created)} criados, {len(errors)} erros")
        
        return {
            "message": "Importação de alimentação concluída",
            "total_processados": len(df),
            "criados": len(created),
            "erros": len(errors),
            "detalhes_erros": errors[:10]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao importar alimentação: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao processar importação: {str(e)}")


@router.get("/alimentacao/export")
async def export_alimentacao(
    data_inicio: Optional[str] = Query(None, description="Data inicial (YYYY-MM-DD)"),
    data_fim: Optional[str] = Query(None, description="Data final (YYYY-MM-DD)"),
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
        
        if not registros:
            raise HTTPException(status_code=404, detail="Nenhum registro encontrado")
        
        df = pd.DataFrame(registros)
        df = df.drop(['_id', 'importado_em'], axis=1, errors='ignore')
        
        # Reordena colunas
        column_order = ['funcionario_id', 'nome', 'data', 'tipo_refeicao', 
                       'valor_unitario', 'quantidade', 'total_dia', 'fornecedor']
        df = df.reindex(columns=[col for col in column_order if col in df.columns])
        
        # Renomeia
        df = df.rename(columns={
            'funcionario_id': 'Funcionário ID',
            'nome': 'Nome',
            'data': 'Data',
            'tipo_refeicao': 'Tipo Refeição',
            'valor_unitario': 'Valor Unitário',
            'quantidade': 'Quantidade',
            'total_dia': 'Total',
            'fornecedor': 'Fornecedor'
        })
        
        excel_buffer = create_excel_from_dataframe(df, 'Alimentação')
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"alimentacao_{timestamp}.xlsx"
        
        logger.info(f"Exportados {len(registros)} registros de alimentação")
        
        return StreamingResponse(
            excel_buffer,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao exportar alimentação: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao gerar exportação: {str(e)}")


# ============================================================================
# ENDPOINTS - MATERIAIS
# ============================================================================

@router.post("/materiais/import")
async def import_materiais(
    file: UploadFile = File(...),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Importa registros de materiais de arquivo Excel/CSV
    
    Colunas obrigatórias:
    - data: Data da movimentação
    - descricao: Descrição do material
    - local_uso: Local de uso
    
    Colunas opcionais:
    - categoria: Categoria do material
    - quantidade: Quantidade
    - valor_unitario: Valor unitário
    - autorizado_por: Responsável pela autorização
    """
    try:
        if not file.filename.endswith(('.xlsx', '.xls', '.csv')):
            raise HTTPException(status_code=400, detail="Arquivo deve ser .xlsx, .xls ou .csv")
        
        content = await file.read()
        df = read_file_to_dataframe(content, file.filename)
        
        # Mapeia colunas
        column_mapping = {
            'data': ['data', 'date', 'dia'],
            'descricao': ['descricao', 'description', 'material', 'item'],
            'local_uso': ['local_uso', 'localuso', 'local', 'obra'],
            'categoria': ['categoria', 'category', 'tipo'],
            'quantidade': ['quantidade', 'qtd', 'qty'],
            'valor_unitario': ['valor_unitario', 'valorunitario', 'valor', 'preco'],
            'autorizado_por': ['autorizado_por', 'autorizadopor', 'responsavel', 'autorizado']
        }
        
        df = map_columns(df, column_mapping)
        validate_required_columns(df, ['data', 'descricao', 'local_uso'])
        
        created = []
        errors = []
        
        for idx, row in df.iterrows():
            try:
                quantidade = clean_and_format_value(row.get('quantidade', 1), 'float')
                valor_unitario = clean_and_format_value(row.get('valor_unitario', 0), 'float')
                
                registro = {
                    'data': clean_and_format_value(row['data'], 'date'),
                    'descricao': clean_and_format_value(row['descricao'], 'string'),
                    'local_uso': clean_and_format_value(row['local_uso'], 'string'),
                    'categoria': clean_and_format_value(row.get('categoria', ''), 'string'),
                    'quantidade': quantidade,
                    'valor_unitario': valor_unitario,
                    'valor_total': round(quantidade * valor_unitario, 2),
                    'autorizado_por': clean_and_format_value(row.get('autorizado_por', ''), 'string'),
                    'importado_em': datetime.now().isoformat()
                }
                
                if not registro['data'] or not registro['descricao']:
                    continue
                
                result = await db.materiais.insert_one(registro)
                created.append(str(result.inserted_id))
                
            except Exception as e:
                errors.append({'linha': idx + 2, 'erro': str(e)})
        
        logger.info(f"Materiais importados: {len(created)} criados, {len(errors)} erros")
        
        return {
            "message": "Importação de materiais concluída",
            "total_processados": len(df),
            "criados": len(created),
            "erros": len(errors),
            "detalhes_erros": errors[:10]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao importar materiais: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao processar importação: {str(e)}")


@router.get("/materiais/export")
async def export_materiais(
    data_inicio: Optional[str] = Query(None, description="Data inicial (YYYY-MM-DD)"),
    data_fim: Optional[str] = Query(None, description="Data final (YYYY-MM-DD)"),
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
        
        if not registros:
            raise HTTPException(status_code=404, detail="Nenhum registro encontrado")
        
        df = pd.DataFrame(registros)
        df = df.drop(['_id', 'importado_em'], axis=1, errors='ignore')
        
        # Reordena colunas
        column_order = ['data', 'descricao', 'local_uso', 'categoria', 
                       'quantidade', 'valor_unitario', 'valor_total', 'autorizado_por']
        df = df.reindex(columns=[col for col in column_order if col in df.columns])
        
        # Renomeia
        df = df.rename(columns={
            'data': 'Data',
            'descricao': 'Descrição',
            'local_uso': 'Local de Uso',
            'categoria': 'Categoria',
            'quantidade': 'Quantidade',
            'valor_unitario': 'Valor Unitário',
            'valor_total': 'Valor Total',
            'autorizado_por': 'Autorizado Por'
        })
        
        excel_buffer = create_excel_from_dataframe(df, 'Materiais')
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"materiais_{timestamp}.xlsx"
        
        logger.info(f"Exportados {len(registros)} registros de materiais")
        
        return StreamingResponse(
            excel_buffer,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao exportar materiais: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao gerar exportação: {str(e)}")
