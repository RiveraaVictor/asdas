const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rota para listar todos os jogos
router.get('/', authMiddleware, gameController.listGames);

// Rota para jogar uma raspadinha específica
router.post('/:id/play', authMiddleware, gameController.playGame);

module.exports = router;