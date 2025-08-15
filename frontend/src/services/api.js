// Arquivo: frontend/src/services/api.js (ATUALIZADO)
import axios from 'axios';

// Cria uma instância do Axios com a URL base da nossa API
const api = axios.create({
  baseURL: 'http://localhost:3001/api'
});

// Interceptor para adicionar o token automaticamente nas requisições
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

// Interceptor para tratar respostas e renovar token se necessário
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Se receber 401 e não for uma tentativa de retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Remove token inválido
      localStorage.removeItem('token');
      
      // Redireciona para login se não estiver já na página de login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Função de login que podemos chamar de qualquer lugar na aplicação
export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro de conexão' };
  }
};

export default api;