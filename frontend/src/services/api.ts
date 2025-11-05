/**
 * API Service - Centraliza todas as chamadas para o backend
 */

const API_BASE_URL = import.meta.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const API_PREFIX = '/api';

class ApiError extends Error {
  constructor(public status: number, public detail: string) {
    super(detail);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${API_PREFIX}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Erro desconhecido' }));
      throw new ApiError(response.status, errorData.detail || response.statusText);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null as T;
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Erro de conexão com o servidor');
  }
}

export const api = {
  // Funcionários
  funcionarios: {
    getAll: (params?: { ativo?: boolean; setor?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.ativo !== undefined) queryParams.append('ativo', String(params.ativo));
      if (params?.setor) queryParams.append('setor', params.setor);
      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      return fetchApi(`/funcionarios${query}`, { method: 'GET' });
    },
    
    getById: (id: string) => 
      fetchApi(`/funcionarios/${id}`, { method: 'GET' }),
    
    getByCpf: (cpf: string) => 
      fetchApi(`/funcionarios/cpf/${cpf}`, { method: 'GET' }),
    
    create: (data: any) => 
      fetchApi('/funcionarios', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    update: (id: string, data: any) => 
      fetchApi(`/funcionarios/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    
    delete: (id: string) => 
      fetchApi(`/funcionarios/${id}`, { method: 'DELETE' }),
  },

  // Frequência
  frequencia: {
    getAll: (params?: { data_inicio?: string; data_fim?: string; funcionario_id?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.data_inicio) queryParams.append('data_inicio', params.data_inicio);
      if (params?.data_fim) queryParams.append('data_fim', params.data_fim);
      if (params?.funcionario_id) queryParams.append('funcionario_id', params.funcionario_id);
      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      return fetchApi(`/frequencia${query}`, { method: 'GET' });
    },
    
    getById: (id: string) => 
      fetchApi(`/frequencia/${id}`, { method: 'GET' }),
    
    getByFuncionarioMes: (funcionario_id: string, ano: number, mes: number) =>
      fetchApi(`/frequencia/funcionario/${funcionario_id}/mes/${ano}/${mes}`, { method: 'GET' }),
    
    create: (data: any) => 
      fetchApi('/frequencia', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    update: (id: string, data: any) => 
      fetchApi(`/frequencia/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    
    delete: (id: string) => 
      fetchApi(`/frequencia/${id}`, { method: 'DELETE' }),
  },

  // Relatórios
  relatorios: {
    gerar: (data: any) => 
      fetchApi('/relatorios/gerar', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
};

export { ApiError };
