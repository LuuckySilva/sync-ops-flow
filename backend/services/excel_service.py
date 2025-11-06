import pandas as pd
from datetime import datetime
from typing import List, Dict, Any
from io import BytesIO
import logging

logger = logging.getLogger(__name__)


class ExcelService:
    """Serviço para importação e exportação de dados em Excel"""
    
    @staticmethod
    def export_funcionarios_to_excel(funcionarios: List[Dict[str, Any]]) -> BytesIO:
        """
        Exporta lista de funcionários para arquivo Excel
        
        Args:
            funcionarios: Lista de dicionários com dados dos funcionários
            
        Returns:
            BytesIO: Buffer com arquivo Excel
        """
        try:
            # Prepara os dados para o DataFrame
            data = []
            for func in funcionarios:
                data.append({
                    'ID': func.get('id', ''),
                    'Nome': func.get('nome', ''),
                    'CPF': func.get('cpf', ''),
                    'Cargo': func.get('cargo', ''),
                    'Setor': func.get('setor', ''),
                    'Data Admissão': func.get('data_admissao', ''),
                    'Telefone': func.get('telefone', ''),
                    'Email': func.get('email', ''),
                    'Ativo': 'Sim' if func.get('ativo', True) else 'Não'
                })
            
            # Cria DataFrame
            df = pd.DataFrame(data)
            
            # Cria buffer de memória
            output = BytesIO()
            
            # Escreve Excel no buffer
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                df.to_excel(writer, sheet_name='Funcionários', index=False)
                
                # Ajusta largura das colunas
                worksheet = writer.sheets['Funcionários']
                for column in worksheet.columns:
                    max_length = 0
                    column_letter = column[0].column_letter
                    for cell in column:
                        try:
                            if len(str(cell.value)) > max_length:
                                max_length = len(cell.value)
                        except:
                            pass
                    adjusted_width = min(max_length + 2, 50)
                    worksheet.column_dimensions[column_letter].width = adjusted_width
            
            output.seek(0)
            logger.info(f"Exportados {len(funcionarios)} funcionários para Excel")
            return output
            
        except Exception as e:
            logger.error(f"Erro ao exportar funcionários: {e}")
            raise ValueError(f"Erro ao gerar arquivo Excel: {str(e)}")
    
    @staticmethod
    def import_funcionarios_from_excel(file_content: bytes) -> List[Dict[str, Any]]:
        """
        Importa funcionários de arquivo Excel
        
        Args:
            file_content: Conteúdo do arquivo Excel em bytes
            
        Returns:
            List[Dict]: Lista de funcionários importados
        """
        try:
            # Lê Excel do buffer
            df = pd.read_excel(BytesIO(file_content), sheet_name='Funcionários')
            
            # Valida colunas obrigatórias
            required_columns = ['Nome', 'CPF', 'Cargo', 'Setor', 'Data Admissão']
            missing_columns = [col for col in required_columns if col not in df.columns]
            
            if missing_columns:
                raise ValueError(f"Colunas obrigatórias ausentes: {', '.join(missing_columns)}")
            
            # Converte DataFrame para lista de dicionários
            funcionarios = []
            for _, row in df.iterrows():
                # Pula linhas vazias
                if pd.isna(row['Nome']) or pd.isna(row['CPF']):
                    continue
                
                funcionario = {
                    'nome': str(row['Nome']).strip(),
                    'cpf': str(row['CPF']).strip(),
                    'cargo': str(row['Cargo']).strip(),
                    'setor': str(row['Setor']).strip(),
                    'data_admissao': row['Data Admissão'] if isinstance(row['Data Admissão'], str) 
                                    else row['Data Admissão'].strftime('%Y-%m-%d'),
                    'telefone': str(row.get('Telefone', '')).strip() if not pd.isna(row.get('Telefone')) else None,
                    'email': str(row.get('Email', '')).strip() if not pd.isna(row.get('Email')) else None,
                    'ativo': row.get('Ativo', 'Sim') == 'Sim'
                }
                
                funcionarios.append(funcionario)
            
            logger.info(f"Importados {len(funcionarios)} funcionários do Excel")
            return funcionarios
            
        except Exception as e:
            logger.error(f"Erro ao importar funcionários: {e}")
            raise ValueError(f"Erro ao processar arquivo Excel: {str(e)}")
    
    @staticmethod
    def export_frequencia_to_excel(registros: List[Dict[str, Any]]) -> BytesIO:
        """
        Exporta registros de frequência para arquivo Excel
        
        Args:
            registros: Lista de dicionários com dados de frequência
            
        Returns:
            BytesIO: Buffer com arquivo Excel
        """
        try:
            # Prepara os dados para o DataFrame
            data = []
            for reg in registros:
                data.append({
                    'ID': reg.get('id', ''),
                    'Funcionário ID': reg.get('funcionario_id', ''),
                    'Data': reg.get('data', ''),
                    'Hora Entrada': reg.get('hora_entrada', ''),
                    'Hora Saída': reg.get('hora_saida', ''),
                    'Horas Trabalhadas': reg.get('horas_trabalhadas', 0),
                    'Observações': reg.get('observacoes', '')
                })
            
            # Cria DataFrame
            df = pd.DataFrame(data)
            
            # Cria buffer de memória
            output = BytesIO()
            
            # Escreve Excel no buffer
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                df.to_excel(writer, sheet_name='Frequência', index=False)
                
                # Ajusta largura das colunas
                worksheet = writer.sheets['Frequência']
                for column in worksheet.columns:
                    max_length = 0
                    column_letter = column[0].column_letter
                    for cell in column:
                        try:
                            if len(str(cell.value)) > max_length:
                                max_length = len(cell.value)
                        except:
                            pass
                    adjusted_width = min(max_length + 2, 50)
                    worksheet.column_dimensions[column_letter].width = adjusted_width
            
            output.seek(0)
            logger.info(f"Exportados {len(registros)} registros de frequência para Excel")
            return output
            
        except Exception as e:
            logger.error(f"Erro ao exportar frequência: {e}")
            raise ValueError(f"Erro ao gerar arquivo Excel: {str(e)}")
