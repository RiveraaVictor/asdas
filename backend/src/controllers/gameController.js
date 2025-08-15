// Arquivo: backend/src/controllers/gameController.js (ATUALIZADO)
const Game = require('../models/Game');
const Prize = require('../models/Prize');
const User = require('../models/User');
const UserPlay = require('../models/UserPlay');
const Transaction = require('../models/Transaction');
const db = require('../config/database');

// Lista todos os jogos disponíveis (apenas ativos para jogadores)
exports.listGames = async (req, res) => {
  try {
    const games = await Game.findAll(); // findAll já filtra apenas jogos ativos
    res.json(games);
  } catch (error) {
    console.error('Erro ao buscar jogos:', error);
    res.status(500).json({ message: "Erro ao buscar jogos." });
  }
};

// Busca detalhes de um jogo específico
exports.getGameDetails = async (req, res) => {
  try {
    const game = await Game.getGameWithPrizes(req.params.id);
    
    if (!game) {
      return res.status(404).json({ message: "Jogo não encontrado." });
    }

    if (!game.is_active) {
      return res.status(400).json({ message: "Este jogo não está disponível no momento." });
    }

    // Não retorna as probabilidades exatas para os jogadores
    const gameForPlayer = {
      id: game.id,
      name: game.name,
      price: game.price,
      theme: game.theme,
      description: game.description,
      rtp: game.rtp
    };

    res.json(gameForPlayer);
  } catch (error) {
    console.error('Erro ao buscar detalhes do jogo:', error);
    res.status(500).json({ message: "Erro ao buscar detalhes do jogo." });
  }
};

// Lógica melhorada para jogar
exports.playGame = async (req, res) => {
  const gameId = req.params.id;
  const userId = req.user.id;

  // Inicia uma transação no banco de dados
  const client = await db.query('BEGIN');

  try {
    // Busca dados do usuário e do jogo
    const user = await User.findById(userId);
    const game = await Game.findById(gameId);

    // Validações
    if (!game) {
      await db.query('ROLLBACK');
      return res.status(404).json({ message: "Jogo não encontrado." });
    }

    if (!game.is_active) {
      await db.query('ROLLBACK');
      return res.status(400).json({ message: "Este jogo não está disponível no momento." });
    }

    if (user.balance < game.price) {
      await db.query('ROLLBACK');
      return res.status(400).json({ message: "Saldo insuficiente para jogar." });
    }

    // Debita o valor do jogo do saldo do usuário
    const newBalance = parseFloat(user.balance) - parseFloat(game.price);
    await db.query('UPDATE users SET balance = $1 WHERE id = $2', [newBalance, userId]);

    // Registra a transação de custo do jogo
    await Transaction.create({
      userId,
      type: 'game_cost',
      amount: game.price,
      status: 'completed',
      description: `Jogada em ${game.name}`
    });

    // Calcula o prêmio usando a lógica de probabilidades
    const prizeResult = await Prize.calculatePrize(gameId, game.price);
    
    let finalBalance = newBalance;
    let transactionId = null;

    // Se ganhou um prêmio, credita na conta
    if (prizeResult.isWinner && prizeResult.prizeValue > 0) {
      finalBalance = newBalance + prizeResult.prizeValue;
      await db.query('UPDATE users SET balance = $1 WHERE id = $2', [finalBalance, userId]);

      // Registra a transação do prêmio
      const prizeTransaction = await Transaction.create({
        userId,
        type: 'prize',
        amount: prizeResult.prizeValue,
        status: 'completed',
        description: `Prêmio ganho em ${game.name}`
      });
      transactionId = prizeTransaction.id;
    }

    // Registra a jogada no histórico
    await UserPlay.create({
      userId,
      gameId,
      amountBet: game.price,
      prizeWon: prizeResult.prizeValue,
      isWinner: prizeResult.isWinner
    });

    await db.query('COMMIT');

    // Resposta para o cliente
    res.json({
      success: true,
      message: prizeResult.isWinner ? 
        `Parabéns! Você ganhou R$ ${prizeResult.prizeValue.toFixed(2)}!` : 
        `Que pena! Não foi desta vez. Tente novamente!`,
      result: {
        isWinner: prizeResult.isWinner,
        prizeValue: prizeResult.prizeValue,
        multiplier: prizeResult.multiplier,
        newBalance: finalBalance,
        transactionId
      }
    });

  } catch (error) {
    await db.query('ROLLBACK');
    console.error("Erro ao processar jogada:", error);
    res.status(500).json({ message: "Erro interno do servidor ao processar a jogada." });
  }
};

// Busca jogos populares/em destaque
exports.getPopularGames = async (req, res) => {
  try {
    const popularGames = await Game.getPopularGames(6);
    res.json(popularGames);
  } catch (error) {
    console.error('Erro ao buscar jogos populares:', error);
    res.status(500).json({ message: "Erro ao buscar jogos populares." });
  }
};

// Histórico de jogadas do usuário
exports.getUserGameHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const history = await UserPlay.findByUserId(userId, limit, offset);
    const stats = await UserPlay.getUserStats(userId);

    res.json({
      history,
      stats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: history.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar histórico de jogos:', error);
    res.status(500).json({ message: "Erro ao buscar histórico de jogos." });
  }
};