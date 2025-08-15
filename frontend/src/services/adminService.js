// Arquivo: frontend/src/services/adminService.js

import api from './api';

// ==================== JOGOS ====================
export const adminGameService = {
  getAll: async () => {
    const response = await api.get('/admin/games');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/admin/games/${id}`);
    return response.data;
  },

  create: async (gameData) => {
    const response = await api.post('/admin/games', gameData);
    return response.data;
  },

  update: async (id, gameData) => {
    const response = await api.put(`/admin/games/${id}`, gameData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/admin/games/${id}`);
    return response.data;
  },

  toggleStatus: async (id) => {
    const response = await api.patch(`/admin/games/${id}/toggle`);
    return response.data;
  }
};

// ==================== PRÊMIOS ====================
export const adminPrizeService = {
  addToGame: async (gameId, prizeData) => {
    const response = await api.post(`/admin/games/${gameId}/prizes`, prizeData);
    return response.data;
  },

  update: async (prizeId, prizeData) => {
    const response = await api.put(`/admin/prizes/${prizeId}`, prizeData);
    return response.data;
  },

  delete: async (prizeId) => {
    const response = await api.delete(`/admin/prizes/${prizeId}`);
    return response.data;
  }
};

// ==================== USUÁRIOS ====================
export const adminUserService = {
  getAll: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  getDetails: async (id) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  }
};

// ==================== TRANSAÇÕES ====================
export const adminTransactionService = {
  getAll: async (params = {}) => {
    const response = await api.get('/admin/transactions', { params });
    return response.data;
  },

  getPendingWithdrawals: async () => {
    const response = await api.get('/admin/transactions/withdrawals/pending');
    return response.data;
  },

  approve: async (id, externalReference) => {
    const response = await api.patch(`/admin/transactions/${id}/approve`, {
      externalReference
    });
    return response.data;
  },

  reject: async (id, reason) => {
    const response = await api.patch(`/admin/transactions/${id}/reject`, {
      reason
    });
    return response.data;
  }
};

// ==================== CUPONS ====================
export const adminCouponService = {
  getAll: async () => {
    const response = await api.get('/admin/coupons');
    return response.data;
  },

  create: async (couponData) => {
    const response = await api.post('/admin/coupons', couponData);
    return response.data;
  },

  update: async (id, couponData) => {
    const response = await api.put(`/admin/coupons/${id}`, couponData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/admin/coupons/${id}`);
    return response.data;
  }
};

// ==================== RELATÓRIOS ====================
export const adminReportService = {
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  getRevenueReport: async (startDate, endDate) => {
    const response = await api.get('/admin/reports/revenue', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  getGamePerformance: async () => {
    const response = await api.get('/admin/reports/game-performance');
    return response.data;
  }
};