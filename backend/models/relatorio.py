from pydantic import BaseModel, Field
from typing import Optional, Literal, List, Dict, Any
from datetime import date


class RelatorioRequest(BaseModel):
    tipo: Literal['frequencia', 'alimentacao', 'materiais', 'combustivel', 'geral']
    data_inicio: str  # formato YYYY-MM-DD
    data_fim: str  # formato YYYY-MM-DD
    funcionario_id: Optional[str] = None
    setor: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "tipo": "frequencia",
                "data_inicio": "2025-01-01",
                "data_fim": "2025-01-31",
                "setor": "Obras"
            }
        }


class RelatorioResponse(BaseModel):
    tipo: str
    periodo: Dict[str, str]
    dados: List[Dict[str, Any]]
    totalizadores: Optional[Dict[str, Any]] = None
    gerado_em: str

    class Config:
        json_schema_extra = {
            "example": {
                "tipo": "frequencia",
                "periodo": {
                    "data_inicio": "2025-01-01",
                    "data_fim": "2025-01-31"
                },
                "dados": [],
                "totalizadores": {
                    "total_registros": 0,
                    "total_horas": 0
                },
                "gerado_em": "2025-01-20T10:30:00"
            }
        }
