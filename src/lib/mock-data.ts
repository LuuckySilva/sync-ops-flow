import { Funcionario, RegistroFrequencia, RegistroAlimentacao, ControleMateria, RegistroCombustivel, Documento } from "@/types";

// Dados mockados para demonstração
export const mockFuncionarios: Funcionario[] = [
  {
    id: "1",
    nome: "Rafael Amaro Nogueira",
    cpf: "123.456.789-00",
    cargo: "Pedreiro",
    setor: "Obras",
    data_admissao: "2024-10-20",
    ativo: true,
    email: "rafael@saneurb.com.br",
    telefone: "(31) 98765-4321"
  },
  {
    id: "2",
    nome: "Irton Ferreira Galdino",
    cpf: "693.739.146-34",
    cargo: "Servente",
    setor: "Obras",
    data_admissao: "2024-10-20",
    ativo: true,
    email: "irton@saneurb.com.br",
    telefone: "(31) 98765-4322"
  },
  {
    id: "3",
    nome: "Edson Martins Cesario",
    cpf: "044.566.446-05",
    cargo: "Encarregado",
    setor: "Obras",
    data_admissao: "2024-10-13",
    ativo: true,
    email: "edson@saneurb.com.br",
    telefone: "(31) 98765-4323"
  },
];

export const mockFrequencia: RegistroFrequencia[] = [
  {
    id: "1",
    funcionario_id: "1",
    nome: "Rafael Amaro Nogueira",
    data: "2025-01-02",
    hora_entrada: "07:00",
    hora_saida: "17:00",
    total_horas: 9,
    tipo_dia: "util"
  },
  {
    id: "2",
    funcionario_id: "2",
    nome: "Irton Ferreira Galdino",
    data: "2025-01-02",
    hora_entrada: "07:00",
    hora_saida: "17:00",
    total_horas: 9,
    tipo_dia: "util"
  },
  {
    id: "3",
    funcionario_id: "3",
    nome: "Edson Martins Cesario",
    data: "2025-01-02",
    hora_entrada: "07:00",
    observacao: "Sem registro de saída",
    tipo_dia: "util"
  },
];

export const mockAlimentacao: RegistroAlimentacao[] = [
  {
    id: "1",
    funcionario_id: "1",
    nome: "Rafael Amaro Nogueira",
    data: "2025-01-02",
    tipo_refeicao: "cafe",
    valor_unitario: 3.80,
    quantidade: 1,
    total_dia: 3.80,
    fornecedor: "Fornecedor A"
  },
  {
    id: "2",
    funcionario_id: "1",
    nome: "Rafael Amaro Nogueira",
    data: "2025-01-02",
    tipo_refeicao: "almoco",
    valor_unitario: 16.50,
    quantidade: 1,
    total_dia: 16.50,
    fornecedor: "Fornecedor A"
  },
];

export const mockMateriais: ControleMateria[] = [
  {
    id: "1",
    data: "2025-01-02",
    descricao: "Cimento Portland CP-II",
    local_uso: "Obra - Fundação Bloco A",
    quantidade: 50,
    valor_unitario: 32.50,
    valor_total: 1625.00,
    autorizado_por: "Eng. João Silva",
    categoria: "Construção"
  },
  {
    id: "2",
    data: "2025-01-02",
    descricao: "Areia Média",
    local_uso: "Obra - Alvenaria Bloco B",
    quantidade: 10,
    valor_unitario: 85.00,
    valor_total: 850.00,
    autorizado_por: "Eng. João Silva",
    categoria: "Construção"
  },
];

export const mockCombustivel: RegistroCombustivel[] = [
  {
    id: "1",
    data: "2025-01-02",
    codigo_nfce: "NFC-12345",
    equipamento: "Betoneira BT-200",
    litros: 25.5,
    preco_litro: 5.89,
    valor_total: 150.20
  },
  {
    id: "2",
    data: "2025-01-02",
    codigo_nfce: "NFC-12346",
    equipamento: "Compactador VB-150",
    litros: 15.0,
    preco_litro: 5.89,
    valor_total: 88.35
  },
];

export const mockDocumentos: Documento[] = [
  {
    id: "1",
    funcionario_id: "1",
    nome: "Rafael Amaro Nogueira",
    tipo_documento: "termo_responsabilidade",
    template_id: "termo_copo",
    status: "assinado",
    data_emissao: "2024-10-20",
    data_assinatura: "2024-10-20"
  },
  {
    id: "2",
    funcionario_id: "2",
    nome: "Irton Ferreira Galdino",
    tipo_documento: "acordo_compensacao",
    template_id: "acordo_horas",
    status: "assinado",
    data_emissao: "2024-10-20",
    data_assinatura: "2024-10-20"
  },
  {
    id: "3",
    funcionario_id: "3",
    nome: "Edson Martins Cesario",
    tipo_documento: "ordem_servico",
    template_id: "os_pedreiro",
    status: "pendente",
    data_emissao: "2024-10-13"
  },
];
