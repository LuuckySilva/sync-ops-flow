import { API_BASE_URL } from "./api";

export const excelApi = {
  /**
   * Exporta funcionários para Excel
   */
  exportFuncionarios: async () => {
    const response = await fetch(`${API_BASE_URL}/excel/funcionarios/export`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Erro ao exportar funcionários');
    }

    // Baixa o arquivo
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `funcionarios_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  /**
   * Importa funcionários de Excel
   */
  importFuncionarios: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/excel/funcionarios/import`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Erro ao importar funcionários');
    }

    return response.json();
  },

  /**
   * Exporta frequência para Excel
   */
  exportFrequencia: async (dataInicio?: string, dataFim?: string) => {
    const params = new URLSearchParams();
    if (dataInicio) params.append('data_inicio', dataInicio);
    if (dataFim) params.append('data_fim', dataFim);

    const response = await fetch(
      `${API_BASE_URL}/excel/frequencia/export?${params.toString()}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      throw new Error('Erro ao exportar frequência');
    }

    // Baixa o arquivo
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `frequencia_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  /**
   * Importa frequência de Excel
   */
  importFrequencia: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/excel/frequencia/import`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Erro ao importar frequência');
    }

    return response.json();
  },

  /**
   * Exporta alimentação para Excel
   */
  exportAlimentacao: async (dataInicio?: string, dataFim?: string) => {
    const params = new URLSearchParams();
    if (dataInicio) params.append('data_inicio', dataInicio);
    if (dataFim) params.append('data_fim', dataFim);

    const response = await fetch(
      `${API_BASE_URL}/excel/alimentacao/export?${params.toString()}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      throw new Error('Erro ao exportar alimentação');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alimentacao_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  /**
   * Importa alimentação de Excel
   */
  importAlimentacao: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/excel/alimentacao/import`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Erro ao importar alimentação');
    }

    return response.json();
  },

  /**
   * Exporta materiais para Excel
   */
  exportMateriais: async (dataInicio?: string, dataFim?: string) => {
    const params = new URLSearchParams();
    if (dataInicio) params.append('data_inicio', dataInicio);
    if (dataFim) params.append('data_fim', dataFim);

    const response = await fetch(
      `${API_BASE_URL}/excel/materiais/export?${params.toString()}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      throw new Error('Erro ao exportar materiais');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `materiais_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  /**
   * Importa materiais de Excel
   */
  importMateriais: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/excel/materiais/import`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Erro ao importar materiais');
    }

    return response.json();
  },
};
