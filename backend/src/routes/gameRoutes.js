// Arquivo: backend/src/routes/gameRoutes.js (ATUALIZADO)
const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rotas públicas (não precisam de autenticação)
router.get('/popular', gameController.getPopularGames);

// Rotas que precisam de autenticação
router.get('/', authMiddleware, gameController.listGames);
router.get('/history', authMiddleware, gameController.getUserGameHistory);
router.get('/:id', authMiddleware, gameController.getGameDetails);
router.post('/:id/play', authMiddleware, gameController.playGame);

module.exports = router;