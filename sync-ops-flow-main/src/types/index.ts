export interface Funcionario {
  id: string;
  nome: string;
  cpf: string;
  cargo: string;
  setor: string;
  data_admissao: string;
  ativo: boolean;
  email?: string;
  telefone?: string;
}

export interface RegistroFrequencia {
  id: string;
  funcionario_id: string;
  nome: string;
  data: string;
  hora_entrada?: string;
  hora_saida?: string;
  total_horas?: number;
  observacao?: string;
  tipo_dia: 'util' | 'feriado' | 'fim_de_semana';
}

export interface RegistroAlimentacao {
  id: string;
  funcionario_id: string;
  nome: string;
  data: string;
  tipo_refeicao: 'cafe' | 'almoco';
  valor_unitario: number;
  quantidade: number;
  total_dia: number;
  fornecedor: string;
}

export interface ControleMateria {
  id: string;
  data: string;
  descricao: string;
  local_uso: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  autorizado_por: string;
  categoria?: string;
}

export interface RegistroCombustivel {
  id: string;
  data: string;
  codigo_nfce: string;
  equipamento: string;
  litros: number;
  preco_litro: number;
  valor_total: number;
}

export interface Documento {
  id: string;
  funcionario_id: string;
  nome: string;
  tipo_documento: 'contrato' | 'termo_responsabilidade' | 'acordo_compensacao' | 'ordem_servico' | 'comunicado' | 'termo_desligamento';
  template_id: string;
  status: 'pendente' | 'assinado';
  data_emissao: string;
  data_assinatura?: string;
  conteudo?: string;
}

export interface Template {
  id: string;
  nome: string;
  tipo: string;
  conteudo: string;
  variaveis: string[];
}

export type RelatorioTipo = 'frequencia' | 'alimentacao' | 'materiais' | 'combustivel' | 'geral';

export interface FiltroRelatorio {
  tipo: RelatorioTipo;
  data_inicio: string;
  data_fim: string;
  funcionario_id?: string;
  setor?: string;
}
