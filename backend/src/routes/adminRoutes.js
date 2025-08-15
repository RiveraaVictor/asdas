// Arquivo: backend/src/routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Middleware aplicado a todas as rotas administrativas
router.use(authMiddleware);
router.use(adminMiddleware);

// ==================== ROTAS DE JOGOS ====================
router.get('/games', adminController.getAllGames);
router.get('/games/:id', adminController.getGameById);
router.post('/games', adminController.createGame);
router.put('/games/:id', adminController.updateGame);
router.delete('/games/:id', adminController.deleteGame);
router.patch('/games/:id/toggle', adminController.toggleGameStatus);

// ==================== ROTAS DE PRÊMIOS ====================
router.post('/games/:gameId/prizes', adminController.addPrizeToGame);
router.put('/prizes/:prizeId', adminController.updatePrize);
router.delete('/prizes/:prizeId', adminController.deletePrize);

// ==================== ROTAS DE USUÁRIOS ====================
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserDetails);

// ==================== ROTAS DE TRANSAÇÕES ====================
router.get('/transactions', adminController.getAllTransactions);
router.get('/transactions/withdrawals/pending', adminController.getPendingWithdrawals);
router.patch('/transactions/:id/approve', adminController.approveWithdrawal);
router.patch('/transactions/:id/reject', adminController.rejectWithdrawal);

// ==================== ROTAS DE CUPONS ====================
router.get('/coupons', adminController.getAllCoupons);
router.post('/coupons', adminController.createCoupon);
router.put('/coupons/:id', adminController.updateCoupon);
router.delete('/coupons/:id', adminController.deleteCoupon);

// ==================== ROTAS DE RELATÓRIOS ====================
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/reports/revenue', adminController.getRevenueReport);
router.get('/reports/game-performance', adminController.getGamePerformanceReport);

module.exports = router;