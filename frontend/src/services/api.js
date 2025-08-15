// Arquivo: frontend/src/services/api.js
import axios from 'axios';

// Cria uma instância do Axios com a URL base da nossa API
const api = axios.create({
  baseURL: 'http://localhost:3001/api' 
});

// Função de login que podemos chamar de qualquer lugar na aplicação
export const loginUser = async (email, password) => {
  // O 'try...catch' é para tratar tanto respostas de sucesso quanto de erro da API
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data; // Retorna os dados da resposta (ex: { message, token })
  } catch (error) {
    // Lança o erro para que o componente que chamou a função possa tratá-lo
    throw error.response.data; 
  }
};

export default api;