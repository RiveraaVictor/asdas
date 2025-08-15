 // Arquivo: backend/src/controllers/gameController.js
const Game = require('../models/Game');
const User = require('../models/User');
const db = require('../config/database');

// Lista todos os jogos disponíveis
exports.listGames = async (req, res) => {
  try {
    const games = await Game.findAll();
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar jogos." });
  }
};

// Lógica para jogar
exports.playGame = async (req, res) => {
  const gameId = req.params.id;
  const userId = req.user.id; // ID do usuário vem do token (via authMiddleware)

  const client = await db.query('BEGIN'); // Inicia uma transação

  try {
    const user = await User.findById(userId);
    const game = await Game.findById(gameId);

    if (!game) {
      return res.status(404).json({ message: "Jogo não encontrado." });
    }

    if (user.balance < game.price) {
      return res.status(400).json({ message: "Saldo insuficiente." });
    }

    // Debita o valor do jogo do saldo do usuário
    const newBalance = user.balance - game.price;
    await db.query('UPDATE users SET balance = $1 WHERE id = $2', [newBalance, userId]);

    // Lógica de premiação (simples por enquanto)
    const prize = Math.random() < 0.2 ? game.price * 5 : 0; // 20% de chance de ganhar 5x o valor

    if (prize > 0) {
      const finalBalance = newBalance + prize;
      await db.query('UPDATE users SET balance = $1 WHERE id = $2', [finalBalance, userId]);
    }

    await db.query('COMMIT'); // Confirma a transação
    res.json({
      message: `Você jogou ${game.name}!`,
      prize: prize,
      newBalance: newBalance + prize
    });

  } catch (error) {
    await db.query('ROLLBACK'); // Desfaz a transação em caso de erro
    console.error("Erro ao jogar:", error);
    res.status(500).json({ message: "Erro ao processar a jogada." });
  }
};