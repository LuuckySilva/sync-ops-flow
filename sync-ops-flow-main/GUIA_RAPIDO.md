# 🚀 Guia Rápido - Integração de Planilhas

## 📥 Como Importar Dados

### Passo 1: Prepare sua planilha

Você pode usar os **templates** disponíveis em `/templates/`:
- `template_frequencia.xlsx` ou `.csv`
- `template_alimentacao.xlsx` ou `.csv`
- `template_materiais.xlsx` ou `.csv`

### Passo 2: Preencha os dados

Abra o template no Excel/Google Sheets e preencha com seus dados.

**⚠️ IMPORTANTE:**
- Não remova as colunas obrigatórias (marcadas em negrito nos templates)
- Use o formato de data `YYYY-MM-DD` (exemplo: 2025-01-10)
- Para valores monetários, use ponto como separador decimal (25.50)

### Passo 3: Importe via API ou Frontend

#### Via curl (linha de comando):
```bash
# Frequência
curl -X POST "http://localhost:8001/api/excel/frequencia/import" \
  -F "file=@sua_planilha.xlsx"

# Alimentação
curl -X POST "http://localhost:8001/api/excel/alimentacao/import" \
  -F "file=@sua_planilha.xlsx"

# Materiais
curl -X POST "http://localhost:8001/api/excel/materiais/import" \
  -F "file=@sua_planilha.xlsx"
```

#### Via Frontend (quando implementado):
1. Acesse o módulo desejado (Frequência, Alimentação ou Materiais)
2. Clique em "Importar Planilha"
3. Selecione seu arquivo
4. Aguarde o processamento
5. Veja o resumo: registros criados e erros (se houver)

---

## 📤 Como Exportar Relatórios

### Via curl:
```bash
# Exportar todos os registros
curl -X GET "http://localhost:8001/api/excel/frequencia/export" -o relatorio.xlsx

# Exportar período específico
curl -X GET "http://localhost:8001/api/excel/frequencia/export?data_inicio=2025-01-01&data_fim=2025-01-31" \
  -o relatorio_janeiro.xlsx
```

### Via Frontend:
1. Acesse o módulo desejado
2. Selecione o período (opcional)
3. Clique em "Exportar Relatório"
4. O arquivo será baixado automaticamente

---

## 📋 Colunas por Módulo

### 🕐 FREQUÊNCIA

**Obrigatórias:**
- `funcionario_id` - ID do funcionário
- `data` - Data (YYYY-MM-DD)

**Opcionais:**
- `hora_entrada` - Horário de entrada (HH:MM)
- `hora_saida` - Horário de saída (HH:MM)
- `tipo_dia` - util, feriado, sabado, domingo
- `observacao` - Observações

**Automático:**
- `horas_trabalhadas` - Calculado automaticamente

---

### 🍽️ ALIMENTAÇÃO

**Obrigatórias:**
- `funcionario_id` - ID do funcionário
- `data` - Data (YYYY-MM-DD)
- `tipo_refeicao` - café, almoço, jantar

**Opcionais:**
- `nome` - Nome do funcionário
- `valor_unitario` - Valor da refeição
- `quantidade` - Quantidade (padrão: 1)
- `fornecedor` - Nome do fornecedor

**Automático:**
- `total_dia` - Calculado automaticamente (valor × quantidade)

---

### 🔧 MATERIAIS

**Obrigatórias:**
- `data` - Data (YYYY-MM-DD)
- `descricao` - Descrição do material
- `local_uso` - Local de uso

**Opcionais:**
- `categoria` - Categoria do material
- `quantidade` - Quantidade (padrão: 1)
- `valor_unitario` - Valor unitário
- `autorizado_por` - Responsável

**Automático:**
- `valor_total` - Calculado automaticamente (quantidade × valor)

---

## 💡 Dicas Importantes

### ✅ Faça:
- Use os templates fornecidos
- Valide dados antes de importar
- Comece com arquivos pequenos para testar
- Acompanhe os logs em caso de erro

### ❌ Evite:
- Arquivos maiores que 10.000 linhas
- Caracteres especiais em nomes
- Deixar colunas obrigatórias vazias
- Formatos de data inconsistentes

---

## 🔍 Verificar se Funcionou

### Via MongoDB:
```bash
mongosh --eval "use test_database; db.frequencia.countDocuments({})"
```

### Via API:
```bash
# Ver todos os registros
curl http://localhost:8001/api/frequencia
```

### Via Frontend:
- Acesse o módulo e veja os dados na tabela

---

## 🆘 Problemas Comuns

### "Colunas obrigatórias ausentes"
**Solução:** Verifique se todas as colunas obrigatórias estão na planilha

### "Formato de arquivo não suportado"
**Solução:** Use apenas .xlsx, .xls ou .csv

### "Nenhum registro encontrado" na exportação
**Solução:** Importe dados primeiro ou verifique os filtros de data

### Dados não aparecem no frontend
**Solução:** Recarregue a página ou verifique se os IDs dos funcionários existem

---

## 📞 Comandos Úteis

```bash
# Ver logs do backend
tail -f /var/log/supervisor/backend.err.log

# Reiniciar backend
sudo supervisorctl restart backend

# Verificar status
sudo supervisorctl status

# Testar API
curl http://localhost:8001/api/

# Documentação interativa
# Abra no navegador: http://localhost:8001/docs
```

---

## 🎯 Fluxo Completo Exemplo

1. **Baixar template:**
   ```bash
   cp /app/sync-ops-flow-main/templates/template_frequencia.xlsx ~/minha_frequencia.xlsx
   ```

2. **Editar no Excel** e preencher com dados reais

3. **Importar:**
   ```bash
   curl -X POST "http://localhost:8001/api/excel/frequencia/import" \
     -F "file=@~/minha_frequencia.xlsx"
   ```

4. **Verificar importação:**
   ```json
   {
     "message": "Importação de frequência concluída",
     "total_processados": 50,
     "criados": 50,
     "erros": 0
   }
   ```

5. **Exportar relatório:**
   ```bash
   curl -X GET "http://localhost:8001/api/excel/frequencia/export" \
     -o relatorio_frequencia.xlsx
   ```

6. **Abrir relatório no Excel** e visualizar dados processados! ✅

---

**🎉 Pronto! Você já sabe usar o sistema de integração de planilhas!**

Para documentação completa, veja: `EXCEL_API_DOCUMENTATION.md`
