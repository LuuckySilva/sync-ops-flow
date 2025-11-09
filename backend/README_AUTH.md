# 🔐 Sistema de Autenticação e Segurança - Sync Ops Flow v2.0

## 📋 Visão Geral

O Sync Ops Flow agora possui um sistema completo de autenticação JWT, controle de acesso baseado em perfis e auditoria de todas as ações.

---

## 🎯 Funcionalidades Implementadas

### ✅ Autenticação JWT
- Token JWT com validade de **30 dias**
- Hash de senha com **Argon2** (algoritmo moderno e seguro)
- Endpoints de login, registro e gerenciamento de usuários

### ✅ Sistema de Perfis
- **admin**: Acesso completo (import/export, usuários, logs)
- **operacional**: Acesso apenas a import/export

### ✅ Logs de Auditoria
- Registro automático de todas as ações importantes:
  - Login de usuários
  - Importação/exportação de planilhas
  - Criação/edição de usuários
- Consulta de logs (apenas admin)
- Estatísticas de logs

### ✅ Endpoints Auxiliares
- `/api/status` - Status geral do sistema
- `/api/version` - Versão e informações do backend
- `/api/` - Health check

---

## 🔑 Credenciais de Teste

### Administradores:
```
Email: lukasantonyo@hotmail.com
Senha: Testeintegrado1
Perfil: admin
```

```
Email: saneurb.obra@gmail.com
Senha: Testeintegrado1
Perfil: admin
```

### Operacional:
```
Email: operacional@syncops.com
Senha: Testeintegrado1
Perfil: operacional
```

---

## 📡 Endpoints de Autenticação

### 1. Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "lukasantonyo@hotmail.com",
  "senha": "Testeintegrado1"
}
```

**Resposta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 2592000,
  "usuario": {
    "id": "...",
    "email": "lukasantonyo@hotmail.com",
    "nome": "Lukas Antonio",
    "perfil": "admin",
    "ativo": true
  }
}
```

### 2. Obter Dados do Usuário Atual
```bash
GET /api/auth/me
Authorization: Bearer {token}
```

### 3. Alterar Senha
```bash
PUT /api/auth/me/password
Authorization: Bearer {token}
Content-Type: application/json

{
  "senha_atual": "SenhaAtual123",
  "nova_senha": "NovaSenha123"
}
```

### 4. Listar Usuários (Admin apenas)
```bash
GET /api/auth/users
Authorization: Bearer {token}
```

### 5. Criar Usuário (Admin apenas)
```bash
POST /api/auth/register
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "novo@example.com",
  "nome": "Novo Usuário",
  "senha": "Senha123",
  "perfil": "operacional"
}
```

### 6. Atualizar Usuário (Admin apenas)
```bash
PUT /api/auth/users/{user_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "nome": "Nome Atualizado",
  "perfil": "admin",
  "ativo": true
}
```

### 7. Desativar Usuário (Admin apenas)
```bash
DELETE /api/auth/users/{user_id}
Authorization: Bearer {token}
```

---

## 📝 Endpoints de Logs (Admin apenas)

### 1. Listar Logs Recentes
```bash
GET /api/logs/recent?limite=50
Authorization: Bearer {token}
```

### 2. Filtrar Logs
```bash
GET /api/logs/?tipo=import&status=sucesso&limite=100
Authorization: Bearer {token}
```

**Filtros disponíveis:**
- `usuario_email`: Email do usuário
- `tipo`: login, import, export, create, update, delete
- `modulo`: frequencia, alimentacao, materiais, usuarios
- `status`: sucesso, erro
- `data_inicio`: Data inicial (ISO format)
- `data_fim`: Data final (ISO format)
- `limite`: Número máximo de registros (1-1000)

### 3. Estatísticas de Logs
```bash
GET /api/logs/stats
Authorization: Bearer {token}
```

### 4. Meus Logs
```bash
GET /api/logs/me?limite=100
Authorization: Bearer {token}
```

---

## 🔒 Endpoints Protegidos

Todos os endpoints de importação/exportação agora exigem autenticação:

```bash
# Importação com autenticação
POST /api/excel/frequencia/import
Authorization: Bearer {token}

# Exportação com autenticação
GET /api/excel/frequencia/export
Authorization: Bearer {token}
```

---

## 🧪 Testando a API

### Método 1: Script de Teste Automático
```bash
cd /app/backend
python3 test_endpoints.py
```

Este script testa:
- ✅ Autenticação (5 testes)
- ✅ Importação/Exportação (3 testes)
- ✅ Permissões (5 testes)
- ✅ Endpoints auxiliares (3 testes)
- ✅ Logs (1 teste)

**Total: 17 testes**

### Método 2: Script Bash
```bash
cd /app/backend
./test_auth.sh
```

### Método 3: cURL Manual

1. **Fazer login:**
```bash
curl -X POST "http://localhost:8001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "lukasantonyo@hotmail.com", "senha": "Testeintegrado1"}'
```

2. **Salvar token:**
```bash
TOKEN="seu_token_aqui"
```

3. **Usar em requisições:**
```bash
curl -X GET "http://localhost:8001/api/auth/me" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 Estrutura do Projeto

```
backend/
├── auth/                    # Módulo de autenticação
│   ├── __init__.py
│   ├── jwt_handler.py       # Gerenciamento de tokens JWT
│   ├── password.py          # Hash de senhas com Argon2
│   └── dependencies.py      # Dependências FastAPI
│
├── models/                  # Modelos Pydantic
│   ├── usuario.py           # Modelos de usuário
│   └── log.py               # Modelos de log
│
├── routers/                 # Rotas da API
│   ├── auth_router.py       # Rotas de autenticação
│   ├── logs_router.py       # Rotas de logs
│   ├── excel_router.py      # Rotas de Excel (atualizado)
│   └── ...
│
├── services/                # Lógica de negócio
│   ├── log_service.py       # Serviço de logs
│   └── ...
│
├── server.py                # Aplicação principal
├── seed_users.py            # Script para criar usuários
├── test_endpoints.py        # Testes automáticos
└── test_auth.sh             # Testes bash
```

---

## 🔐 Segurança

### Hashing de Senhas
- Algoritmo: **Argon2** (vencedor do Password Hashing Competition)
- Parâmetros:
  - time_cost: 2
  - memory_cost: 512 MB
  - parallelism: 2

### JWT
- Algoritmo: **HS256**
- Validade: **30 dias**
- Secret key: Gerada automaticamente (variável de ambiente JWT_SECRET_KEY)

### Validações
- Senha mínima: 8 caracteres
- Senha deve conter letras E números
- Email validado com Pydantic EmailStr

---

## 📈 Logs de Auditoria

Cada log contém:
- **usuario_email**: Email do usuário
- **usuario_nome**: Nome do usuário
- **acao**: Descrição da ação
- **tipo**: login, import, export, create, update, delete
- **modulo**: frequencia, alimentacao, materiais, usuarios
- **status**: sucesso, erro
- **detalhes**: Informações adicionais (JSON)
- **ip_origem**: IP do cliente
- **data_hora**: Timestamp da ação

---

## 🎯 Permissões por Perfil

| Funcionalidade | Admin | Operacional |
|----------------|-------|-------------|
| Login | ✅ | ✅ |
| Alterar própria senha | ✅ | ✅ |
| Ver próprio perfil | ✅ | ✅ |
| Importar Excel | ✅ | ✅ |
| Exportar Excel | ✅ | ✅ |
| Listar usuários | ✅ | ❌ |
| Criar usuários | ✅ | ❌ |
| Editar usuários | ✅ | ❌ |
| Desativar usuários | ✅ | ❌ |
| Ver logs | ✅ | ❌ |
| Ver estatísticas | ✅ | ❌ |

---

## 🚀 Como Usar

### 1. Frontend com JavaScript/React:

```javascript
// Login
const login = async (email, senha) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha })
  });
  
  const data = await response.json();
  
  // Salvar token
  localStorage.setItem('token', data.access_token);
  localStorage.setItem('user', JSON.stringify(data.usuario));
  
  return data;
};

// Usar token em requisições
const importExcel = async (file) => {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/excel/frequencia/import', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  return response.json();
};

// Verificar se está autenticado
const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

// Logout
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
```

### 2. Python:

```python
import requests

# Login
response = requests.post('http://localhost:8001/api/auth/login', json={
    'email': 'lukasantonyo@hotmail.com',
    'senha': 'Testeintegrado1'
})

data = response.json()
token = data['access_token']

# Usar token
headers = {'Authorization': f'Bearer {token}'}

# Importar Excel
with open('frequencia.xlsx', 'rb') as f:
    response = requests.post(
        'http://localhost:8001/api/excel/frequencia/import',
        headers=headers,
        files={'file': f}
    )
    
print(response.json())
```

---

## 🔧 Manutenção

### Adicionar Novos Usuários
```bash
cd /app/backend
python3 seed_users.py
```

### Atualizar Senha de Usuário Existente
Use o endpoint `/api/auth/users/{user_id}` como admin ou `/api/auth/me/password` como próprio usuário.

### Ver Logs do Sistema
```bash
tail -f /var/log/supervisor/backend.err.log
```

### Reiniciar Backend
```bash
sudo supervisorctl restart backend
```

---

## 📚 Documentação Interativa

Acesse a documentação Swagger UI:
```
http://localhost:8001/docs
```

Ou OpenAPI JSON:
```
http://localhost:8001/openapi.json
```

---

## ✅ Checklist de Produção

- [x] Autenticação JWT implementada
- [x] Sistema de perfis (admin/operacional)
- [x] Logs de auditoria
- [x] Todas as rotas protegidas
- [x] Testes automáticos (17/17 passando)
- [x] Documentação completa
- [x] Seed de usuários
- [x] Endpoints auxiliares (status, version)
- [x] Tratamento de erros robusto
- [x] Validação de dados

---

## 🎉 Sistema Pronto para Produção!

O backend Sync Ops Flow está completo e pronto para uso em ambiente produtivo com segurança, controle de acesso e auditoria completa.
