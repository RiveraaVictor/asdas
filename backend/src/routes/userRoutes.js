// Arquivo: backend/src/routes/userRoutes.js (ATUALIZADO)
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// Todas as rotas precisam de autenticação
router.use(authMiddleware);

// Rotas do perfil
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

// Rotas financeiras
router.get('/balance', userController.getBalance);
router.get('/transactions', userController.getTransactionHistory);
router.post('/withdrawal', userController.requestWithdrawal);

// Rotas de cupons
router.post('/coupon/use', userController.useCoupon);

// Dashboard do usuário
router.get('/dashboard', userController.getDashboard);

module.exports = router;