# 🏢 WorkFlow Pro - Sistema de Gestão Empresarial

> Plataforma completa para gestão de funcionários, controle de frequência e geração de relatórios corporativos

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

![WorkFlow Pro Dashboard](https://via.placeholder.com/800x400/3b82f6/ffffff?text=WorkFlow+Pro+Dashboard)

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Instalação](#-instalação)
- [Uso](#-uso)
- [API Documentation](#-api-documentation)
- [Estrutura do Projeto](#-estrutura-do-projeto)

---

## 🎯 Sobre o Projeto

**WorkFlow Pro** é um sistema completo de gestão empresarial desenvolvido para facilitar o controle de operações diárias, incluindo:

- **Cadastro e gestão de funcionários**
- **Controle de ponto e frequência**
- **Geração de relatórios gerenciais**
- **Dashboard com estatísticas em tempo real**

### 🎨 Diferenciais

- ✅ Interface moderna e responsiva
- ✅ Arquitetura modular e escalável
- ✅ API RESTful documentada
- ✅ Validação robusta de dados
- ✅ Feedback visual instantâneo
- ✅ Estados de carregamento e erro bem definidos

---

## ⚡ Funcionalidades

### 👥 Gestão de Funcionários

- Cadastro completo com validação de CPF, e-mail e telefone
- Edição e desativação de funcionários
- Filtros por setor e status
- Busca por nome ou CPF

### 📅 Controle de Frequência

- Registro de ponto com horário de entrada e saída
- Cálculo automático de horas trabalhadas
- Diferenciação entre dia útil, feriado e fim de semana
- Histórico completo de registros

### 📊 Relatórios e Dashboard

- Dashboard com estatísticas em tempo real:
  - Total de funcionários ativos
  - Horas trabalhadas no mês
  - Presenças registradas
  - Média de horas por dia
- Relatórios personalizados por período
- Totalizadores e agregações

---

## 🛠️ Tecnologias

### Frontend

- **React 18** - Biblioteca JavaScript para interfaces
- **TypeScript** - Tipagem estática
- **Vite** - Build tool moderna e rápida
- **TailwindCSS** - Framework CSS utility-first
- **Shadcn/ui** - Componentes UI acessíveis
- **React Query** - Gerenciamento de estado assíncrono
- **React Hook Form** - Formulários performáticos
- **Zod** - Validação de schemas

### Backend

- **FastAPI** - Framework Python moderno e rápido
- **MongoDB** - Banco de dados NoSQL
- **Motor** - Driver assíncrono para MongoDB
- **Pydantic** - Validação de dados
- **Python 3.11+** - Linguagem de programação

---

## 🏗️ Arquitetura

O projeto segue uma arquitetura em camadas com separação clara de responsabilidades:

```
┌─────────────────────────────────────┐
│         React Frontend              │
│  (Components, Hooks, Services)      │
└──────────────┬──────────────────────┘
               │ HTTP/REST
               ▼
┌─────────────────────────────────────┐
│         FastAPI Backend             │
│  ┌─────────────────────────────┐   │
│  │  Routers (API Endpoints)    │   │
│  └────────────┬────────────────┘   │
│               │                     │
│  ┌────────────▼────────────────┐   │
│  │  Services (Business Logic)  │   │
│  └────────────┬────────────────┘   │
│               │                     │
│  ┌────────────▼────────────────┐   │
│  │  Models (Data Validation)   │   │
│  └─────────────────────────────┘   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│         MongoDB Database            │
│  (funcionarios, frequencia)         │
└─────────────────────────────────────┘
```

### Padrões Utilizados

- **Dependency Injection** - FastAPI
- **Repository Pattern** - Camada de serviços
- **Custom Hooks** - React Query
- **Atomic Design** - Componentes UI

---

## 🚀 Instalação

### Pré-requisitos

- Node.js 18+ e Yarn
- Python 3.11+
- MongoDB 5.0+

### Passo a Passo

#### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/workflow-pro.git
cd workflow-pro
```

#### 2. Configure as variáveis de ambiente

**Backend** (`/backend/.env`):
```bash
MONGO_URL=mongodb://localhost:27017
DB_NAME=workflow_pro
CORS_ORIGINS=http://localhost:3000
```

**Frontend** (`/frontend/.env`):
```bash
REACT_APP_BACKEND_URL=http://localhost:8001
VITE_APP_NAME="WorkFlow Pro"
VITE_APP_VERSION="1.0.0"
```

#### 3. Instale as dependências

**Backend:**
```bash
cd backend
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
yarn install
```

#### 4. Inicie os serviços

**MongoDB:**
```bash
mongod --dbpath /data/db
```

**Backend:**
```bash
cd backend
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

**Frontend:**
```bash
cd frontend
yarn dev
```

#### 5. Acesse a aplicação

- Frontend: http://localhost:3000
- Backend API: http://localhost:8001
- API Docs: http://localhost:8001/docs

---

## 💻 Uso

### Interface Web

1. **Dashboard**: Visualize estatísticas gerais
2. **Funcionários**: Cadastre e gerencie sua equipe
3. **Frequência**: Registre pontos e controle horas
4. **Relatórios**: Gere relatórios personalizados

### Exemplos de Uso da API

#### Cadastrar um funcionário

```bash
curl -X POST "http://localhost:8001/api/funcionarios" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "cpf": "123.456.789-01",
    "cargo": "Desenvolvedor",
    "setor": "TI",
    "email": "joao@empresa.com",
    "telefone": "(31) 98765-4321",
    "data_admissao": "2024-01-15"
  }'
```

#### Registrar frequência

```bash
curl -X POST "http://localhost:8001/api/frequencia" \
  -H "Content-Type: application/json" \
  -d '{
    "funcionario_id": "uuid-do-funcionario",
    "data": "2024-01-20",
    "hora_entrada": "08:00",
    "hora_saida": "18:00",
    "tipo_dia": "util"
  }'
```

#### Gerar relatório

```bash
curl -X POST "http://localhost:8001/api/relatorios/gerar" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "frequencia",
    "data_inicio": "2024-01-01",
    "data_fim": "2024-01-31",
    "setor": "TI"
  }'
```

---

## 📚 API Documentation

### Endpoints Principais

#### Funcionários

- `GET /api/funcionarios` - Lista todos os funcionários
- `GET /api/funcionarios/{id}` - Busca por ID
- `GET /api/funcionarios/cpf/{cpf}` - Busca por CPF
- `POST /api/funcionarios` - Cria novo funcionário
- `PUT /api/funcionarios/{id}` - Atualiza funcionário
- `DELETE /api/funcionarios/{id}` - Desativa funcionário

#### Frequência

- `GET /api/frequencia` - Lista registros
- `GET /api/frequencia/{id}` - Busca por ID
- `GET /api/frequencia/funcionario/{id}/mes/{ano}/{mes}` - Busca por mês
- `POST /api/frequencia` - Registra frequência
- `PUT /api/frequencia/{id}` - Atualiza registro
- `DELETE /api/frequencia/{id}` - Remove registro

#### Relatórios

- `POST /api/relatorios/gerar` - Gera relatório customizado

### Documentação Interativa

Acesse http://localhost:8001/docs para documentação Swagger completa.

---

## 📁 Estrutura do Projeto

```
workflow-pro/
├── backend/
│   ├── models/              # Modelos Pydantic
│   │   ├── funcionario.py
│   │   ├── frequencia.py
│   │   └── relatorio.py
│   ├── services/            # Lógica de negócio
│   │   ├── funcionario_service.py
│   │   ├── frequencia_service.py
│   │   └── relatorio_service.py
│   ├── routers/             # Endpoints da API
│   │   ├── funcionarios.py
│   │   ├── frequencia.py
│   │   └── relatorios.py
│   ├── dependencies.py      # Dependency injection
│   ├── server.py            # Aplicação FastAPI
│   └── requirements.txt     # Dependências Python
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   │   ├── funcionarios/
│   │   │   ├── frequencia/
│   │   │   ├── dashboard/
│   │   │   └── ui/
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API service
│   │   ├── types/           # TypeScript types
│   │   └── config/          # Configurações
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

---

## 🎓 Aprendizados e Técnicas

Este projeto demonstra:

- ✅ Arquitetura limpa e modular
- ✅ Separação de responsabilidades
- ✅ Validação robusta de dados
- ✅ Gerenciamento de estado eficiente
- ✅ UI/UX moderna e responsiva
- ✅ API RESTful bem documentada
- ✅ Tratamento de erros adequado
- ✅ Boas práticas de desenvolvimento

---

## 🔮 Melhorias Futuras

- [ ] Autenticação e autorização (JWT)
- [ ] Módulos adicionais (alimentação, materiais, combustível)
- [ ] Geração de PDF para relatórios
- [ ] Notificações por e-mail
- [ ] Aplicativo mobile
- [ ] Testes automatizados
- [ ] CI/CD

---

<div align="center">
  <strong>WorkFlow Pro - Gestão Empresarial Moderna</strong><br>
  Desenvolvido com ❤️ para demonstração de habilidades full-stack
</div>
