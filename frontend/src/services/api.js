import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API_BASE
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Serviços de Excel
export const excelService = {
  importFrequencia: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/excel/frequencia/import', formData);
  },
  
  exportFrequencia: (dataInicio, dataFim) => {
    const params = {};
    if (dataInicio) params.data_inicio = dataInicio;
    if (dataFim) params.data_fim = dataFim;
    return api.get('/excel/frequencia/export', { 
      params,
      responseType: 'blob'
    });
  },
  
  importAlimentacao: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/excel/alimentacao/import', formData);
  },
  
  exportAlimentacao: (dataInicio, dataFim) => {
    const params = {};
    if (dataInicio) params.data_inicio = dataInicio;
    if (dataFim) params.data_fim = dataFim;
    return api.get('/excel/alimentacao/export', { 
      params,
      responseType: 'blob'
    });
  },
  
  importMateriais: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/excel/materiais/import', formData);
  },
  
  exportMateriais: (dataInicio, dataFim) => {
    const params = {};
    if (dataInicio) params.data_inicio = dataInicio;
    if (dataFim) params.data_fim = dataFim;
    return api.get('/excel/materiais/export', { 
      params,
      responseType: 'blob'
    });
  }
};

// Serviços de usuários (admin apenas)
export const userService = {
  listUsers: () => api.get('/auth/users'),
  
  createUser: (userData) => api.post('/auth/register', userData),
  
  updateUser: (userId, userData) => api.put(`/auth/users/${userId}`, userData),
  
  deleteUser: (userId) => api.delete(`/auth/users/${userId}`)
};

// Serviços de logs (admin apenas)
export const logService = {
  getRecentLogs: (limite = 50) => api.get(`/logs/recent?limite=${limite}`),
  
  filterLogs: (filters) => api.get('/logs/', { params: filters }),
  
  getStats: () => api.get('/logs/stats'),
  
  getMyLogs: (limite = 100) => api.get(`/logs/me?limite=${limite}`)
};

// Serviços de sistema
export const systemService = {
  getStatus: () => api.get('/status'),
  
  getVersion: () => api.get('/version')
};

export default api;
