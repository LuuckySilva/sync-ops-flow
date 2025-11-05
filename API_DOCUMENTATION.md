# 📖 WorkFlow Pro - API Documentation

## Base URL

```
http://localhost:8001/api
```

## Autenticação

_Nota: A autenticação será implementada em versões futuras_

---

## 📑 Endpoints

### Health Check

#### GET /

Verifica o status da API

**Response:**
```json
{
  "message": "SANEURB API - Sistema de Gestão de Obras",
  "status": "online",
  "version": "1.0.0"
}
```

---

## 👥 Funcionários

### GET /funcionarios

Lista todos os funcionários

**Query Parameters:**
- `ativo` (boolean, optional) - Filtrar por status
- `setor` (string, optional) - Filtrar por setor

**Response:**
```json
[
  {
    "id": "uuid",
    "nome": "João Silva",
    "cpf": "123.456.789-01",
    "cargo": "Desenvolvedor",
    "setor": "TI",
    "data_admissao": "2024-01-15",
    "ativo": true,
    "email": "joao@empresa.com",
    "telefone": "(31) 98765-4321"
  }
]
```

### GET /funcionarios/{id}

Busca funcionário por ID

**Path Parameters:**
- `id` (string) - ID do funcionário

**Response:**
```json
{
  "id": "uuid",
  "nome": "João Silva",
  "cpf": "123.456.789-01",
  "cargo": "Desenvolvedor",
  "setor": "TI",
  "data_admissao": "2024-01-15",
  "ativo": true,
  "email": "joao@empresa.com",
  "telefone": "(31) 98765-4321"
}
```

**Error Responses:**
- `404 Not Found` - Funcionário não encontrado

### GET /funcionarios/cpf/{cpf}

Busca funcionário por CPF

**Path Parameters:**
- `cpf` (string) - CPF do funcionário (formato: XXX.XXX.XXX-XX)

**Response:** Same as GET /funcionarios/{id}

### POST /funcionarios

Cria novo funcionário

**Request Body:**
```json
{
  "nome": "João Silva",
  "cpf": "123.456.789-01",
  "cargo": "Desenvolvedor",
  "setor": "TI",
  "data_admissao": "2024-01-15",
  "email": "joao@empresa.com",
  "telefone": "(31) 98765-4321"
}
```

**Validations:**
- `nome`: mínimo 3 caracteres
- `cpf`: formato XXX.XXX.XXX-XX, único
- `cargo`: mínimo 2 caracteres
- `setor`: mínimo 2 caracteres
- `email`: formato válido de e-mail
- `telefone`: formato (XX) XXXXX-XXXX
- `data_admissao`: formato YYYY-MM-DD

**Response:** `201 Created`
```json
{
  "id": "uuid-gerado",
  "nome": "João Silva",
  "cpf": "123.456.789-01",
  "cargo": "Desenvolvedor",
  "setor": "TI",
  "data_admissao": "2024-01-15",
  "ativo": true,
  "email": "joao@empresa.com",
  "telefone": "(31) 98765-4321"
}
```

**Error Responses:**
- `400 Bad Request` - Validação falhou ou CPF já existe

### PUT /funcionarios/{id}

Atualiza funcionário existente

**Path Parameters:**
- `id` (string) - ID do funcionário

**Request Body:** (todos os campos opcionais)
```json
{
  "nome": "João Silva Junior",
  "cargo": "Desenvolvedor Sênior",
  "setor": "TI",
  "email": "joao.junior@empresa.com",
  "telefone": "(31) 98765-4321",
  "ativo": true
}
```

**Response:**
```json
{
  "id": "uuid",
  "nome": "João Silva Junior",
  "cpf": "123.456.789-01",
  "cargo": "Desenvolvedor Sênior",
  "setor": "TI",
  "data_admissao": "2024-01-15",
  "ativo": true,
  "email": "joao.junior@empresa.com",
  "telefone": "(31) 98765-4321"
}
```

**Error Responses:**
- `404 Not Found` - Funcionário não encontrado
- `400 Bad Request` - CPF já em uso por outro funcionário

### DELETE /funcionarios/{id}

Desativa funcionário (soft delete)

**Path Parameters:**
- `id` (string) - ID do funcionário

**Response:** `204 No Content`

**Error Responses:**
- `404 Not Found` - Funcionário não encontrado

---

## 📅 Frequência

### GET /frequencia

Lista registros de frequência

**Query Parameters:**
- `data_inicio` (string, optional) - Data inicial (YYYY-MM-DD)
- `data_fim` (string, optional) - Data final (YYYY-MM-DD)
- `funcionario_id` (string, optional) - ID do funcionário

**Response:**
```json
[
  {
    "id": "uuid",
    "funcionario_id": "uuid",
    "nome": "João Silva",
    "data": "2024-01-20",
    "hora_entrada": "08:00",
    "hora_saida": "18:00",
    "total_horas": 10.0,
    "tipo_dia": "util",
    "observacao": null
  }
]
```

### GET /frequencia/{id}

Busca registro por ID

**Path Parameters:**
- `id` (string) - ID do registro

**Response:**
```json
{
  "id": "uuid",
  "funcionario_id": "uuid",
  "nome": "João Silva",
  "data": "2024-01-20",
  "hora_entrada": "08:00",
  "hora_saida": "18:00",
  "total_horas": 10.0,
  "tipo_dia": "util",
  "observacao": null
}
```

### GET /frequencia/funcionario/{funcionario_id}/mes/{ano}/{mes}

Busca registros de um funcionário em um mês específico

**Path Parameters:**
- `funcionario_id` (string) - ID do funcionário
- `ano` (integer) - Ano (ex: 2024)
- `mes` (integer) - Mês (1-12)

**Response:** Array de registros de frequência

### POST /frequencia

Registra nova frequência

**Request Body:**
```json
{
  "funcionario_id": "uuid",
  "data": "2024-01-20",
  "hora_entrada": "08:00",
  "hora_saida": "18:00",
  "tipo_dia": "util",
  "observacao": "Opcional"
}
```

**Validations:**
- `funcionario_id`: deve existir
- `data`: formato YYYY-MM-DD, não pode ter registro duplicado
- `hora_entrada`: formato HH:MM
- `hora_saida`: formato HH:MM (opcional)
- `tipo_dia`: "util", "feriado" ou "fim_de_semana"

**Response:** `201 Created`
```json
{
  "id": "uuid-gerado",
  "funcionario_id": "uuid",
  "nome": "João Silva",
  "data": "2024-01-20",
  "hora_entrada": "08:00",
  "hora_saida": "18:00",
  "total_horas": 10.0,
  "tipo_dia": "util",
  "observacao": null
}
```

**Error Responses:**
- `400 Bad Request` - Funcionário não encontrado ou registro duplicado
- `400 Bad Request` - Validação falhou

### PUT /frequencia/{id}

Atualiza registro de frequência

**Path Parameters:**
- `id` (string) - ID do registro

**Request Body:** (todos os campos opcionais)
```json
{
  "hora_entrada": "07:30",
  "hora_saida": "17:30",
  "tipo_dia": "util",
  "observacao": "Ajuste de horário"
}
```

**Response:**
```json
{
  "id": "uuid",
  "funcionario_id": "uuid",
  "nome": "João Silva",
  "data": "2024-01-20",
  "hora_entrada": "07:30",
  "hora_saida": "17:30",
  "total_horas": 10.0,
  "tipo_dia": "util",
  "observacao": "Ajuste de horário"
}
```

### DELETE /frequencia/{id}

Remove registro de frequência

**Path Parameters:**
- `id` (string) - ID do registro

**Response:** `204 No Content`

---

## 📊 Relatórios

### POST /relatorios/gerar

Gera relatório customizado

**Request Body:**
```json
{
  "tipo": "frequencia",
  "data_inicio": "2024-01-01",
  "data_fim": "2024-01-31",
  "funcionario_id": "uuid (opcional)",
  "setor": "TI (opcional)"
}
```

**Tipos de Relatório:**
- `frequencia` - Relatório de presença e horas trabalhadas
- `geral` - Resumo geral de todas as áreas
- `alimentacao` - Em desenvolvimento
- `materiais` - Em desenvolvimento
- `combustivel` - Em desenvolvimento

**Response (tipo: frequencia):**
```json
{
  "tipo": "frequencia",
  "periodo": {
    "data_inicio": "2024-01-01",
    "data_fim": "2024-01-31"
  },
  "dados": [
    {
      "funcionario_id": "uuid",
      "nome": "João Silva",
      "total_registros": 20,
      "total_horas": 180.0,
      "dias_trabalhados": 20
    }
  ],
  "totalizadores": {
    "total_registros": 20,
    "total_horas": 180.0,
    "total_funcionarios": 1
  },
  "gerado_em": "2024-01-31T23:59:59.000000"
}
```

**Response (tipo: geral):**
```json
{
  "tipo": "geral",
  "periodo": {
    "data_inicio": "2024-01-01",
    "data_fim": "2024-01-31"
  },
  "dados": [
    {
      "categoria": "Funcionários",
      "total_ativos": 24,
      "por_setor": {
        "TI": 5,
        "Administrativo": 10,
        "Obras": 9
      }
    },
    {
      "categoria": "Frequência",
      "total_registros": 480,
      "total_horas": 4320.0
    }
  ],
  "totalizadores": {
    "funcionarios_ativos": 24,
    "total_horas_periodo": 4320.0
  },
  "gerado_em": "2024-01-31T23:59:59.000000"
}
```

**Error Responses:**
- `400 Bad Request` - Validação falhou
- `501 Not Implemented` - Tipo de relatório não implementado

---

## ❌ Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Recurso criado |
| 204 | Sem conteúdo (deleção bem-sucedida) |
| 400 | Requisição inválida (validação falhou) |
| 404 | Recurso não encontrado |
| 500 | Erro interno do servidor |
| 501 | Não implementado |

## 📝 Formato de Erro

```json
{
  "detail": "Mensagem de erro detalhada"
}
```

---

## 🔗 Links Úteis

- Documentação Interativa (Swagger): http://localhost:8001/docs
- ReDoc: http://localhost:8001/redoc

---

<div align="center">
  <strong>WorkFlow Pro API v1.0.0</strong>
</div>
