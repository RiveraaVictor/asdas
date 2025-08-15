// Arquivo: frontend/src/services/authService.js

import api from './api';

export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro de conexão' };
  }
};

export const registerUser = async ({ name, email, password, confirmPassword }) => {
  try {
    const response = await api.post('/auth/register', {
      name,
      email,
      password,
      confirmPassword
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro de conexão' };
  }
};

export const validateToken = async () => {
  try {
    const response = await api.get('/auth/validate');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Token inválido' };
  }
};

export const refreshToken = async () => {
  try {
    const response = await api.post('/auth/refresh-token');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao renovar token' };
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Erro ao solicitar recuperação' };
  }
};