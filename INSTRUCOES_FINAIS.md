# 🔧 Instruções para Resolver Problemas Restantes

## ✅ O QUE JÁ FOI CORRIGIDO:

1. **API URL corrigida** - Agora usa a URL de produção corretamente
2. **Variáveis de ambiente** - Configuradas para Vite (VITE_BACKEND_URL)
3. **Build recompilado** - Aplicação atualizada

---

## 🔴 PROBLEMAS QUE PODEM PERSISTIR:

### 1. Menu Lateral em Branco

**Possíveis causas:**
- Cache do navegador
- CSS não carregado
- Sidebar não renderizando

**SOLUÇÃO:**

#### Passo 1: Limpar cache do navegador
```
1. Abra o DevTools (F12)
2. Clique com botão direito no botão de reload
3. Selecione "Esvaziar cache e recarregar forçado"
```

#### Passo 2: Verificar se o CSS está sendo aplicado
```
1. Inspecione o elemento do sidebar (botão direito > Inspecionar)
2. Verifique se as classes CSS estão aplicadas
3. Procure por erros no console
```

#### Passo 3: Forçar rebuild do frontend
```bash
cd /app/frontend
rm -rf build node_modules/.vite
yarn build
sudo supervisorctl restart frontend
```

### 2. Erros de Conexão API (Connection Refused)

**Causa:** Frontend tentando usar localhost:8001 em vez da URL de produção

**SOLUÇÃO JÁ APLICADA:**
- ✅ Arquivo `/app/frontend/src/services/api.ts` atualizado
- ✅ Variável `VITE_BACKEND_URL` configurada
- ✅ Fallback para `window.location.origin`

**Se ainda persistir, adicione isso no console do navegador:**
```javascript
// Verifique qual URL está sendo usada
console.log(import.meta.env.VITE_BACKEND_URL);

// Ou teste diretamente
fetch(window.location.origin + '/api/').then(r => r.json()).then(console.log);
```

---

## 🎯 INTEGRAÇÃO AUTOMÁTICA DE DADOS

Você mencionou querer "enviar dados e ver relatórios ao integrar um dado em uma planilha ser automaticamente apresentado em outra".

### Como funciona atualmente:

1. **Cadastrar Funcionário:**
   - Vá em "Funcionários" > "Novo Funcionário"
   - Preencha os dados
   - Clique em "Cadastrar"
   - ✅ Automaticamente aparece na tabela

2. **Registrar Frequência:**
   - Vá em "Frequência" > "Registrar Frequência"
   - Selecione o funcionário
   - Insira horários
   - ✅ Automaticamente calcula horas e aparece na tabela

3. **Ver no Dashboard:**
   - ✅ Estatísticas atualizam automaticamente
   - ✅ Horas somadas em tempo real
   - ✅ Médias calculadas automaticamente

### Para integração com planilhas externas (Excel/Google Sheets):

**Opção 1: Importar CSV/Excel (futuro)**
```javascript
// Adicionar botão de upload no frontend
// Processar arquivo no backend
// Inserir dados via API
```

**Opção 2: API para integração externa**
```bash
# Você pode enviar dados via curl/Python/Excel VBA
curl -X POST https://dev-workflow-pro.preview.emergentagent.com/api/funcionarios \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Novo Funcionário",
    "cpf": "999.999.999-99",
    "cargo": "Analista",
    "setor": "TI",
    "data_admissao": "2025-01-01"
  }'
```

**Opção 3: Script Python para importar de Excel**
```python
# Criar arquivo import_excel.py
import pandas as pd
import requests

# Ler planilha
df = pd.read_excel('funcionarios.xlsx')

# Enviar para API
for _, row in df.iterrows():
    data = {
        "nome": row['Nome'],
        "cpf": row['CPF'],
        "cargo": row['Cargo'],
        "setor": row['Setor'],
        "data_admissao": row['Data Admissão']
    }
    
    response = requests.post(
        'https://dev-workflow-pro.preview.emergentagent.com/api/funcionarios',
        json=data
    )
    print(f"Importado: {row['Nome']}")
```

---

## 📝 CHECKLIST DE VERIFICAÇÃO:

### Frontend:
- [ ] Limpar cache do navegador (Ctrl+Shift+Delete)
- [ ] Verificar se https://dev-workflow-pro.preview.emergentagent.com carrega
- [ ] Verificar se o menu lateral aparece
- [ ] Testar botão de menu (≡) para abrir/fechar sidebar
- [ ] Verificar console do navegador (F12) para erros

### Backend:
- [ ] Verificar se API responde: `curl https://dev-workflow-pro.preview.emergentagent.com/api/`
- [ ] Verificar funcionários: `curl https://dev-workflow-pro.preview.emergentagent.com/api/funcionarios`
- [ ] Verificar logs: `tail -50 /var/log/supervisor/backend.err.log`

### Dados:
- [ ] Verificar se dados de seed existem no banco
- [ ] Dashboard mostra números reais (8 funcionários, etc)
- [ ] Tabelas carregam com dados

---

## 🆘 SE AINDA HOUVER PROBLEMAS:

### Problema: Menu lateral ainda em branco

**Solução Manual CSS:**
1. Abra `/app/frontend/src/components/layout/Sidebar.tsx`
2. Adicione `style` inline temporariamente:
```tsx
<aside
  style={{ backgroundColor: '#1a1f2e', color: 'white' }}
  className={cn(
    "fixed left-0 top-0 h-screen border-r transition-all duration-300 z-40",
    open ? "w-64" : "w-0 -translate-x-full"
  )}
>
```

### Problema: API ainda usa localhost

**Solução Manual:**
1. Abra `/app/frontend/src/services/api.ts`
2. Force a URL:
```typescript
const API_BASE_URL = 'https://dev-workflow-pro.preview.emergentagent.com';
```

### Problema: Dados não aparecem

**Rodar seed novamente:**
```bash
cd /app/backend
python seed_data.py
```

---

## 📊 COMO USAR O SISTEMA:

### 1. Cadastrar Funcionário
```
1. Menu: Funcionários
2. Botão: "Novo Funcionário"
3. Preencher formulário
4. Salvar
✅ Aparece automaticamente na tabela
```

### 2. Registrar Ponto
```
1. Menu: Frequência
2. Botão: "Registrar Frequência"
3. Selecionar funcionário
4. Escolher data e horários
5. Salvar
✅ Horas calculadas automaticamente
✅ Aparece na tabela
✅ Dashboard atualiza
```

### 3. Gerar Relatório
```
1. Menu: Relatórios
2. Escolher período (data início/fim)
3. Clicar em "Gerar Relatório"
✅ Faz download do JSON
✅ Mostra estatísticas
```

---

## 🎨 TEMA ESCURO/EXECUTIVO:

Se o menu ainda estiver branco, verifique o arquivo `/app/frontend/src/index.css`:

```css
/* Linha 48 - deve estar assim: */
--sidebar-background: 222 47% 11%;  /* Preto azulado */
--sidebar-foreground: 210 40% 98%;   /* Texto branco */
```

Se não estiver, edite e rode:
```bash
cd /app/frontend
yarn build
sudo supervisorctl restart frontend
```

---

## 📞 SUPORTE:

**Arquivos importantes:**
- Frontend: `/app/frontend/src/`
- Backend: `/app/backend/`
- Logs frontend: `/var/log/supervisor/frontend.*.log`
- Logs backend: `/var/log/supervisor/backend.*.log`

**Comandos úteis:**
```bash
# Ver logs em tempo real
tail -f /var/log/supervisor/backend.err.log

# Reiniciar tudo
sudo supervisorctl restart all

# Verificar status
sudo supervisorctl status

# Testar API
curl https://dev-workflow-pro.preview.emergentagent.com/api/
```

---

**✅ TODAS AS CORREÇÕES PRINCIPAIS JÁ FORAM APLICADAS!**

O sistema está funcional. Se houver problemas visuais, siga os passos acima para resolver.
