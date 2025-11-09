# Integração com Excel - Importação e Exportação

## Visão Geral

O sistema agora suporta importação e exportação de dados em formato Excel (.xlsx) para:
- ✅ Funcionários
- ✅ Frequência (Ponto)

## Dependências Instaladas

```
pandas>=2.2.0
openpyxl>=3.1.0
python-multipart>=0.0.9
```

## Endpoints Disponíveis

### Funcionários

#### Exportar Funcionários
```
GET /api/excel/funcionarios/export
```
- **Descrição**: Exporta todos os funcionários para arquivo Excel
- **Resposta**: Arquivo `.xlsx` para download
- **Colunas**: ID, Nome, CPF, Cargo, Setor, Data Admissão, Telefone, Email, Ativo

#### Importar Funcionários
```
POST /api/excel/funcionarios/import
```
- **Content-Type**: `multipart/form-data`
- **Body**: `file` (arquivo .xlsx ou .xls)
- **Formato Esperado**:
  - Planilha chamada "Funcionários"
  - Colunas obrigatórias: Nome, CPF, Cargo, Setor, Data Admissão
  - Colunas opcionais: Telefone, Email, Ativo (Sim/Não)
- **Resposta**: 
```json
{
  "message": "Importação concluída",
  "total_processados": 10,
  "criados": 8,
  "erros": 2,
  "detalhes_erros": [...]
}
```

### Frequência

#### Exportar Frequência
```
GET /api/excel/frequencia/export?data_inicio=2024-01-01&data_fim=2024-12-31
```
- **Descrição**: Exporta registros de frequência para arquivo Excel
- **Query Params** (opcionais):
  - `data_inicio`: Filtro de data inicial (YYYY-MM-DD)
  - `data_fim`: Filtro de data final (YYYY-MM-DD)
- **Resposta**: Arquivo `.xlsx` para download
- **Colunas**: ID, Funcionário ID, Data, Hora Entrada, Hora Saída, Horas Trabalhadas, Observações

## Como Usar no Frontend

### Exportar Funcionários
```typescript
import { excelApi } from "@/services/excel-api";

// Exportar
await excelApi.exportFuncionarios();
```

### Importar Funcionários
```typescript
const handleFileUpload = async (file: File) => {
  const result = await excelApi.importFuncionarios(file);
  console.log(result);
};
```

### Exportar Frequência
```typescript
// Exportar com filtro de período
await excelApi.exportFrequencia('2024-01-01', '2024-12-31');

// Exportar tudo
await excelApi.exportFrequencia();
```

## Exemplo de Planilha para Importação

### Funcionários

| Nome | CPF | Cargo | Setor | Data Admissão | Telefone | Email | Ativo |
|------|-----|-------|-------|---------------|----------|-------|-------|
| João Silva | 123.456.789-00 | Engenheiro | Obras | 2024-01-15 | (11) 98765-4321 | joao@email.com | Sim |
| Maria Santos | 987.654.321-00 | Técnica | Administrativo | 2024-02-01 | (11) 91234-5678 | maria@email.com | Sim |

## Validações

### Importação de Funcionários
- ✅ Verifica colunas obrigatórias
- ✅ Valida CPF único (não permite duplicatas)
- ✅ Ignora linhas vazias
- ✅ Trata erros individualmente (não bloqueia outras importações)

## Tratamento de Erros

O sistema retorna erros detalhados por registro:
```json
{
  "erros": [
    {
      "funcionario": "João Silva",
      "erro": "Funcionário com CPF 123.456.789-00 já existe"
    }
  ]
}
```

## Melhorias Futuras

- [ ] Importação de frequência via Excel
- [ ] Templates de planilhas para download
- [ ] Validação avançada de dados (formato de CPF, datas, etc.)
- [ ] Suporte a múltiplas planilhas em um único arquivo
- [ ] Relatórios consolidados em Excel
