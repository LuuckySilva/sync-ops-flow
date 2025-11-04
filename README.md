# Saneurb - Sistema de Gestão Operacional

Sistema interno de gestão operacional desenvolvido para Saneurb Construtora LTDA. Este sistema centraliza e automatiza o controle de funcionários, frequência, alimentação, materiais, combustível e documentação.

## 🚀 Funcionalidades

### Dashboard Principal
- Visão geral com estatísticas em tempo real
- Gráficos de gastos mensais por categoria
- Atividades recentes do sistema
- Ações rápidas para operações comuns

### Gestão de Funcionários
- Cadastro completo de funcionários
- Controle de admissões e desligamentos
- Sincronização automática com outros módulos
- Status de ativação/desativação

### Controle de Frequência
- Registro de ponto (entrada/saída)
- Cálculo automático de horas trabalhadas
- Marcação de feriados e finais de semana
- Alertas para inconsistências (ponto sem saída)
- Relatórios mensais de faltas e horas extras

### Controle de Alimentação
- Registro de refeições (café da manhã e almoço)
- Valores padrão: R$ 3,80 (café) e R$ 16,50 (almoço)
- Cálculo automático por funcionário e fornecedor
- Relatório de notas fiscais para conferência

### Controle de Materiais
- Registro de consumo de materiais e insumos
- Controle por local de uso e categoria
- Autorização e rastreamento de gastos
- Relatórios de consumo por setor

### Controle de Combustível
- Registro de abastecimentos por equipamento
- Controle de litros e valores
- Vinculação com código NFC-e
- Resumo mensal de consumo

### Documentação
- Templates padrão da empresa:
  - Contrato de Trabalho
  - Termo de Responsabilidade
  - Acordo de Compensação de Horas
  - Ordem de Serviço
  - Comunicados
  - Termo de Desligamento
- Geração automática com placeholders personalizáveis
- Controle de status (pendente/assinado)
- Sistema de assinatura digital

### Relatórios
- Fechamento mensal de alimentação
- Relatório de frequência e horas
- Consumo de materiais por setor
- Controle de combustível por equipamento
- Documentação pendente
- Relatório geral operacional

## 🎨 Design System

O sistema utiliza um design corporativo moderno com:
- **Cores primárias**: Azul corporativo (#2563EB) e Ciano (#00BCD4)
- **Tipografia**: Sistema de fontes responsivo
- **Componentes**: shadcn/ui com customizações
- **Layout**: Sidebar fixa com navegação intuitiva
- **Responsividade**: Totalmente adaptável para mobile e desktop

## 🛠️ Tecnologias

- **React 18** - Framework frontend
- **TypeScript** - Tipagem estática
- **Vite** - Build tool otimizado
- **Tailwind CSS** - Estilização com design system
- **shadcn/ui** - Componentes UI de alta qualidade
- **Recharts** - Gráficos e visualizações
- **React Router** - Navegação SPA
- **Lucide React** - Ícones modernos

## 📋 Estrutura de Dados

### Funcionário
```typescript
{
  id: string;
  nome: string;
  cpf: string;
  cargo: string;
  setor: string;
  data_admissao: string;
  ativo: boolean;
}
```

### Registro de Frequência
```typescript
{
  id: string;
  funcionario_id: string;
  data: string;
  hora_entrada?: string;
  hora_saida?: string;
  total_horas?: number;
  tipo_dia: 'util' | 'feriado' | 'fim_de_semana';
}
```

### Registro de Alimentação
```typescript
{
  id: string;
  funcionario_id: string;
  data: string;
  tipo_refeicao: 'cafe' | 'almoco';
  valor_unitario: number;
  quantidade: number;
  total_dia: number;
  fornecedor: string;
}
```

## 🔄 Sincronização de Dados

O sistema mantém sincronização automática entre módulos:

1. **Novo funcionário** → Automaticamente incluído em:
   - Planilha de Frequência
   - Planilha de Alimentação
   - Documentação inicial (contrato, termos, OS)

2. **Funcionário inativo** → Automaticamente:
   - Removido de listas de Alimentação e Frequência
   - Gera Termo de Desligamento
   - Mantém histórico para consulta

## 📊 Cálculos Automáticos

- **Alimentação**: Soma automática por funcionário e fornecedor
- **Frequência**: Total de horas mensais e identificação de faltas
- **Materiais**: Totais por setor e categoria
- **Combustível**: Consumo total por equipamento e período

## 🔐 Permissões

- **Admin RH**: Acesso completo, aprovação e exclusão de dados
- **Operacional**: Consulta e registro de novos dados

## 📦 Como Usar

```sh
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 🚀 Próximos Passos

Para transformar este MVP em um sistema completo:

1. **Backend**: Integrar com Lovable Cloud para persistência de dados
2. **Upload**: Implementar importação real de planilhas XLSX/CSV
3. **Autenticação**: Sistema de login e controle de permissões
4. **Notificações**: Alertas automáticos para inconsistências
5. **Auditoria**: Log completo de alterações e uploads
6. **Assinatura Digital**: Integração com certificado digital
7. **Relatórios PDF**: Geração de PDFs formatados para impressão

## 📄 Licença

© 2025 Saneurb Construtora LTDA - Todos os direitos reservados
