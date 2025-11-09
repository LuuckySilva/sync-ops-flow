# 📊 API de Integração de Planilhas Excel/CSV
## Sync Ops Flow - Sistema de Gestão Interna

---

## 🎯 VISÃO GERAL

Este módulo permite **importar e exportar** dados entre planilhas Excel/CSV e o sistema, automatizando a integração de dados entre diferentes módulos.

### ✅ Funcionalidades Implementadas:

| Módulo | Importação | Exportação |
|--------|-----------|-----------|
| **Frequência** | ✅ POST `/api/excel/frequencia/import` | ✅ GET `/api/excel/frequencia/export` |
| **Alimentação** | ✅ POST `/api/excel/alimentacao/import` | ✅ GET `/api/excel/alimentacao/export` |
| **Materiais** | ✅ POST `/api/excel/materiais/import` | ✅ GET `/api/excel/materiais/export` |

---

## 📥 IMPORTAÇÃO DE PLANILHAS

### 1️⃣ Importar Frequência

**Endpoint:** `POST /api/excel/frequencia/import`

**Formato aceito:** `.xlsx`, `.xls`, `.csv`

**Colunas obrigatórias:**
- `funcionario_id` - ID do funcionário
- `data` - Data do registro (YYYY-MM-DD ou DD/MM/YYYY)

**Colunas opcionais:**
- `hora_entrada` - Horário de entrada (HH:MM)
- `hora_saida` - Horário de saída (HH:MM)
- `tipo_dia` - Tipo de dia (util, feriado, sabado, domingo)
- `observacao` - Observações adicionais

**Cálculos automáticos:**
- ✅ **Horas trabalhadas** calculadas automaticamente quando entrada e saída são fornecidas

**Exemplo de planilha CSV:**
```csv
funcionario_id,data,hora_entrada,hora_saida,tipo_dia,observacao
FUNC001,2025-01-10,08:00,17:00,util,Trabalho normal
FUNC002,2025-01-10,09:00,18:00,util,Entrada atrasada
FUNC003,2025-01-11,08:00,12:00,sabado,Meio período
```

**Teste via curl:**
```bash
curl -X POST "http://localhost:8001/api/excel/frequencia/import" \
  -F "file=@frequencia.xlsx"
```

**Resposta de sucesso:**
```json
{
  "message": "Importação de frequência concluída",
  "total_processados": 3,
  "criados": 3,
  "erros": 0,
  "detalhes_erros": []
}
```

---

### 2️⃣ Importar Alimentação

**Endpoint:** `POST /api/excel/alimentacao/import`

**Formato aceito:** `.xlsx`, `.xls`, `.csv`

**Colunas obrigatórias:**
- `funcionario_id` - ID do funcionário
- `data` - Data da refeição
- `tipo_refeicao` - Tipo (café, almoço, jantar)

**Colunas opcionais:**
- `nome` - Nome do funcionário
- `valor_unitario` - Valor unitário da refeição (aceita R$ 25,50 ou 25.50)
- `quantidade` - Quantidade de refeições (padrão: 1)
- `fornecedor` - Nome do fornecedor

**Cálculos automáticos:**
- ✅ **Total do dia** = valor_unitario × quantidade (calculado automaticamente)

**Exemplo de planilha CSV:**
```csv
funcionario_id,nome,data,tipo_refeicao,valor_unitario,quantidade,fornecedor
FUNC001,João Silva,2025-01-10,almoço,25.50,1,Restaurante Bom Sabor
FUNC002,Maria Santos,2025-01-10,almoço,25.50,1,Restaurante Bom Sabor
FUNC003,Pedro Oliveira,2025-01-10,jantar,30.00,1,Churrascaria Gaúcha
```

**Teste via curl:**
```bash
curl -X POST "http://localhost:8001/api/excel/alimentacao/import" \
  -F "file=@alimentacao.xlsx"
```

---

### 3️⃣ Importar Materiais

**Endpoint:** `POST /api/excel/materiais/import`

**Formato aceito:** `.xlsx`, `.xls`, `.csv`

**Colunas obrigatórias:**
- `data` - Data da movimentação
- `descricao` - Descrição do material
- `local_uso` - Local de uso

**Colunas opcionais:**
- `categoria` - Categoria do material (Construção, Hidráulica, Elétrica)
- `quantidade` - Quantidade (padrão: 1)
- `valor_unitario` - Valor unitário
- `autorizado_por` - Responsável pela autorização

**Cálculos automáticos:**
- ✅ **Valor total** = quantidade × valor_unitario (calculado automaticamente)

**Exemplo de planilha CSV:**
```csv
data,descricao,local_uso,categoria,quantidade,valor_unitario,autorizado_por
2025-01-10,Cimento 50kg,Obra Centro,Construção,100,35.00,Eng. Carlos
2025-01-10,Areia lavada m³,Obra Centro,Construção,5,80.00,Eng. Carlos
2025-01-11,Tijolo cerâmico,Obra Bairro Sul,Construção,5000,0.85,Eng. Ana
```

**Teste via curl:**
```bash
curl -X POST "http://localhost:8001/api/excel/materiais/import" \
  -F "file=@materiais.xlsx"
```

---

## 📤 EXPORTAÇÃO DE PLANILHAS

### 1️⃣ Exportar Frequência

**Endpoint:** `GET /api/excel/frequencia/export`

**Query params opcionais:**
- `data_inicio` - Data inicial (YYYY-MM-DD)
- `data_fim` - Data final (YYYY-MM-DD)

**Exemplo:**
```bash
# Exportar todos os registros
curl -X GET "http://localhost:8001/api/excel/frequencia/export" -o frequencia.xlsx

# Exportar apenas janeiro de 2025
curl -X GET "http://localhost:8001/api/excel/frequencia/export?data_inicio=2025-01-01&data_fim=2025-01-31" \
  -o frequencia_janeiro.xlsx
```

**Formato do arquivo gerado:**
- Planilha "Frequência" com cabeçalhos formatados
- Colunas auto-ajustadas
- Formatação profissional (cabeçalho azul com texto branco)

---

### 2️⃣ Exportar Alimentação

**Endpoint:** `GET /api/excel/alimentacao/export`

**Query params opcionais:**
- `data_inicio` - Data inicial (YYYY-MM-DD)
- `data_fim` - Data final (YYYY-MM-DD)

**Exemplo:**
```bash
curl -X GET "http://localhost:8001/api/excel/alimentacao/export" -o alimentacao.xlsx
```

---

### 3️⃣ Exportar Materiais

**Endpoint:** `GET /api/excel/materiais/export`

**Query params opcionais:**
- `data_inicio` - Data inicial (YYYY-MM-DD)
- `data_fim` - Data final (YYYY-MM-DD)

**Exemplo:**
```bash
curl -X GET "http://localhost:8001/api/excel/materiais/export" -o materiais.xlsx
```

---

## 🎨 RECURSOS AVANÇADOS

### ✅ Validação Inteligente de Colunas

O sistema aceita **variações** nos nomes das colunas:

| Coluna Padrão | Variações Aceitas |
|---------------|-------------------|
| `funcionario_id` | funcionarioid, id_funcionario, funcionario, id |
| `data` | date, dia |
| `hora_entrada` | horaentrada, entrada, checkin |
| `valor_unitario` | valorunitario, valor, preco |

### ✅ Detecção Automática de Encoding

Para arquivos CSV, o sistema tenta automaticamente:
- UTF-8
- ISO-8859-1
- Latin1
- CP1252

### ✅ Limpeza Automática de Dados

- Remove espaços extras
- Formata valores monetários (aceita R$ 25,50 ou 25.50)
- Converte datas em diferentes formatos
- Trata valores nulos e vazios

### ✅ Cálculos Automáticos

| Módulo | Cálculo |
|--------|---------|
| Frequência | Horas trabalhadas = saída - entrada |
| Alimentação | Total dia = valor_unitario × quantidade |
| Materiais | Valor total = quantidade × valor_unitario |

---

## 🔧 TRATAMENTO DE ERROS

### Erro: Coluna obrigatória ausente

**Resposta:**
```json
{
  "detail": "Colunas obrigatórias ausentes: funcionario_id, data"
}
```

**Solução:** Verifique se a planilha contém todas as colunas obrigatórias.

---

### Erro: Formato de arquivo não suportado

**Resposta:**
```json
{
  "detail": "Arquivo deve ser .xlsx, .xls ou .csv"
}
```

**Solução:** Use apenas arquivos Excel (.xlsx, .xls) ou CSV (.csv).

---

### Importação com erros parciais

**Resposta:**
```json
{
  "message": "Importação concluída",
  "total_processados": 10,
  "criados": 8,
  "erros": 2,
  "detalhes_erros": [
    {
      "linha": 5,
      "erro": "Campo funcionario_id não pode estar vazio"
    },
    {
      "linha": 7,
      "erro": "Data inválida"
    }
  ]
}
```

**Comportamento:** O sistema continua processando mesmo com erros, importando os registros válidos.

---

## 📝 LOGS

Todos os eventos são registrados no log do backend:

```bash
# Ver logs em tempo real
tail -f /var/log/supervisor/backend.err.log

# Buscar logs de importação
grep "importad" /var/log/supervisor/backend.err.log
```

**Exemplos de logs:**
```
INFO - Frequência importada: 3 criados, 0 erros
INFO - CSV lido com encoding: utf-8
INFO - Exportados 10 registros de alimentação
```

---

## 🚀 EXEMPLO COMPLETO DE FLUXO

### Cenário: Importar frequência e gerar relatório

1. **Preparar planilha CSV:**
```csv
funcionario_id,data,hora_entrada,hora_saida
FUNC001,2025-01-10,08:00,17:00
FUNC002,2025-01-10,08:30,17:30
```

2. **Importar dados:**
```bash
curl -X POST "http://localhost:8001/api/excel/frequencia/import" \
  -F "file=@frequencia.csv"
```

3. **Verificar dados importados** (acessar frontend ou API)

4. **Exportar relatório:**
```bash
curl -X GET "http://localhost:8001/api/excel/frequencia/export?data_inicio=2025-01-01" \
  -o relatorio_frequencia.xlsx
```

5. **Abrir Excel e visualizar dados processados** ✅

---

## 🔗 INTEGRAÇÃO COM FRONTEND

### JavaScript/React exemplo:

```javascript
// Importar arquivo
const formData = new FormData();
formData.append('file', file);

const response = await fetch('/api/excel/frequencia/import', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(`Importados: ${result.criados} registros`);

// Exportar arquivo
const blob = await fetch('/api/excel/frequencia/export').then(r => r.blob());
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'frequencia.xlsx';
a.click();
```

---

## 💡 DICAS DE USO

### ✅ Boas Práticas:

1. **Nomes de colunas:** Use nomes padronizados para evitar erros
2. **Validação prévia:** Valide dados no Excel antes de importar
3. **Backup:** Faça backup antes de importações em massa
4. **Testes pequenos:** Teste com poucos registros primeiro
5. **Monitorar logs:** Acompanhe logs para detectar problemas

### ⚠️ Evite:

1. **Planilhas muito grandes:** Limite a 10.000 linhas por importação
2. **Caracteres especiais:** Use UTF-8 para evitar problemas
3. **Datas inconsistentes:** Padronize formato de data (YYYY-MM-DD)
4. **Campos vazios:** Preencha colunas obrigatórias

---

## 🎯 PRÓXIMOS PASSOS

Para integrar no frontend:
1. Adicionar botão "Importar Planilha" em cada módulo
2. Adicionar botão "Exportar Relatório" 
3. Mostrar resumo após importação (criados/erros)
4. Adicionar preview de dados antes de importar
5. Implementar drag & drop para upload

---

## 📞 SUPORTE TÉCNICO

**Arquivos importantes:**
- Router: `/app/backend/routers/excel_router.py`
- Server: `/app/backend/server.py`
- Logs: `/var/log/supervisor/backend.err.log`

**Testar API:**
- Documentação interativa: `http://localhost:8001/docs`
- OpenAPI JSON: `http://localhost:8001/openapi.json`

**Status dos serviços:**
```bash
sudo supervisorctl status
```

**Reiniciar backend:**
```bash
sudo supervisorctl restart backend
```

---

## ✅ CHECKLIST DE FUNCIONAMENTO

- [x] Importação de Frequência (.csv e .xlsx)
- [x] Importação de Alimentação (.csv e .xlsx)
- [x] Importação de Materiais (.csv e .xlsx)
- [x] Exportação de Frequência (.xlsx)
- [x] Exportação de Alimentação (.xlsx)
- [x] Exportação de Materiais (.xlsx)
- [x] Validação de colunas obrigatórias
- [x] Cálculos automáticos (horas, totais)
- [x] Formatação de Excel profissional
- [x] Tratamento de erros robusto
- [x] Logs detalhados
- [x] Suporte a diferentes encodings
- [x] Mapeamento flexível de colunas

---

**🎉 Sistema pronto para uso em produção!**
