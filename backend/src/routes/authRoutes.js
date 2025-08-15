// Arquivo: backend/src/routes/authRoutes.js (ATUALIZADO)

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rotas públicas
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Rotas que precisam de autenticação
router.post('/refresh-token', authMiddleware, authController.refreshToken);
router.get('/validate', authMiddleware, authController.validateToken);

module.exports = router;