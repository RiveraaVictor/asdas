// Arquivo: backend/src/controllers/adminController.js

const Game = require('../models/Game');
const Prize = require('../models/Prize');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const UserPlay = require('../models/UserPlay');
const Coupon = require('../models/Coupon');

// ==================== GESTÃO DE JOGOS ====================

exports.getAllGames = async (req, res) => {
  try {
    const games = await Game.findAll(true); // Inclui jogos inativos
    res.json(games);
  } catch (error) {
    console.error('Erro ao buscar jogos:', error);
    res.status(500).json({ message: 'Erro ao buscar jogos.' });
  }
};

exports.getGameById = async (req, res) => {
  try {
    const game = await Game.getGameWithPrizes(req.params.id);
    if (!game) {
      return res.status(404).json({ message: 'Jogo não encontrado.' });
    }
    res.json(game);
  } catch (error) {
    console.error('Erro ao buscar jogo:', error);
    res.status(500).json({ message: 'Erro ao buscar jogo.' });
  }
};

exports.createGame = async (req, res) => {
  try {
    const { name, price, theme, description, rtp, prizes } = req.body;

    // Validações
    if (!name || !price) {
      return res.status(400).json({ message: 'Nome e preço são obrigatórios.' });
    }

    if (price <= 0) {
      return res.status(400).json({ message: 'Preço deve ser maior que zero.' });
    }

    if (rtp && (rtp < 0 || rtp > 100)) {
      return res.status(400).json({ message: 'RTP deve estar entre 0 e 100.' });
    }

    // Cria o jogo
    const game = await Game.create({ name, price, theme, description, rtp });

    // Se foram fornecidos prêmios, cria eles também
    if (prizes && Array.isArray(prizes)) {
      for (const prize of prizes) {
        await Prize.create({
          gameId: game.id,
          prizeValue: prize.value,
          probability: prize.probability,
          multiplier: prize.multiplier || (prize.value / price)
        });
      }
    }

    res.status(201).json({ message: 'Jogo criado com sucesso!', game });
  } catch (error) {
    console.error('Erro ao criar jogo:', error);
    res.status(500).json({ message: 'Erro ao criar jogo.' });
  }
};

exports.updateGame = async (req, res) => {
  try {
    const { name, price, theme, description, rtp, isActive } = req.body;
    const gameId = req.params.id;

    const updatedGame = await Game.update(gameId, {
      name, price, theme, description, rtp, isActive
    });

    if (!updatedGame) {
      return res.status(404).json({ message: 'Jogo não encontrado.' });
    }

    res.json({ message: 'Jogo atualizado com sucesso!', game: updatedGame });
  } catch (error) {
    console.error('Erro ao atualizar jogo:', error);
    res.status(500).json({ message: 'Erro ao atualizar jogo.' });
  }
};

exports.deleteGame = async (req, res) => {
  try {
    const deletedGame = await Game.deleteById(req.params.id);
    
    if (!deletedGame) {
      return res.status(404).json({ message: 'Jogo não encontrado.' });
    }

    res.json({ message: 'Jogo deletado com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar jogo:', error);
    res.status(500).json({ message: 'Erro ao deletar jogo.' });
  }
};

exports.toggleGameStatus = async (req, res) => {
  try {
    const game = await Game.toggleActive(req.params.id);
    
    if (!game) {
      return res.status(404).json({ message: 'Jogo não encontrado.' });
    }

    res.json({ 
      message: `Jogo ${game.is_active ? 'ativado' : 'desativado'} com sucesso!`, 
      game 
    });
  } catch (error) {
    console.error('Erro ao alterar status do jogo:', error);
    res.status(500).json({ message: 'Erro ao alterar status do jogo.' });
  }
};

// ==================== GESTÃO DE PRÊMIOS ====================

exports.addPrizeToGame = async (req, res) => {
  try {
    const { prizeValue, probability, multiplier } = req.body;
    const gameId = req.params.gameId;

    // Verifica se o jogo existe
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: 'Jogo não encontrado.' });
    }

    const prize = await Prize.create({
      gameId,
      prizeValue,
      probability,
      multiplier: multiplier || (prizeValue / game.price)
    });

    res.status(201).json({ message: 'Prêmio adicionado com sucesso!', prize });
  } catch (error) {
    console.error('Erro ao adicionar prêmio:', error);
    res.status(500).json({ message: 'Erro ao adicionar prêmio.' });
  }
};

exports.updatePrize = async (req, res) => {
  try {
    const { prizeValue, probability, multiplier } = req.body;
    const prizeId = req.params.prizeId;

    const prize = await Prize.update(prizeId, { prizeValue, probability, multiplier });
    
    if (!prize) {
      return res.status(404).json({ message: 'Prêmio não encontrado.' });
    }

    res.json({ message: 'Prêmio atualizado com sucesso!', prize });
  } catch (error) {
    console.error('Erro ao atualizar prêmio:', error);
    res.status(500).json({ message: 'Erro ao atualizar prêmio.' });
  }
};

exports.deletePrize = async (req, res) => {
  try {
    const prize = await Prize.deleteById(req.params.prizeId);
    
    if (!prize) {
      return res.status(404).json({ message: 'Prêmio não encontrado.' });
    }

    res.json({ message: 'Prêmio deletado com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar prêmio:', error);
    res.status(500).json({ message: 'Erro ao deletar prêmio.' });
  }
};

// ==================== GESTÃO DE USUÁRIOS ====================

exports.getAllUsers = async (req, res) => {
  try {
    const { rows } = await require('../config/database').query(
      'SELECT id, name, email, balance, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ message: 'Erro ao buscar usuários.' });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Remove a senha dos dados retornados
    const { password, ...userDetails } = user;
    
    // Busca estatísticas do usuário
    const stats = await UserPlay.getUserStats(userId);
    const recentPlays = await UserPlay.findByUserId(userId, 10);

    res.json({ user: userDetails, stats, recentPlays });
  } catch (error) {
    console.error('Erro ao buscar detalhes do usuário:', error);
    res.status(500).json({ message: 'Erro ao buscar detalhes do usuário.' });
  }
};

// ==================== GESTÃO DE TRANSAÇÕES ====================

exports.getAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 50, type, status, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    const filters = {};
    if (type) filters.type = type;
    if (status) filters.status = status;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const transactions = await Transaction.findAll(limit, offset, filters);
    res.json(transactions);
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    res.status(500).json({ message: 'Erro ao buscar transações.' });
  }
};

exports.getPendingWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Transaction.getPendingWithdrawals();
    res.json(withdrawals);
  } catch (error) {
    console.error('Erro ao buscar saques pendentes:', error);
    res.status(500).json({ message: 'Erro ao buscar saques pendentes.' });
  }
};

exports.approveWithdrawal = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const { externalReference } = req.body;

    const transaction = await Transaction.updateStatus(transactionId, 'completed', externalReference);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transação não encontrada.' });
    }

    res.json({ message: 'Saque aprovado com sucesso!', transaction });
  } catch (error) {
    console.error('Erro ao aprovar saque:', error);
    res.status(500).json({ message: 'Erro ao aprovar saque.' });
  }
};

exports.rejectWithdrawal = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const { reason } = req.body;

    // Busca a transação
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: 'Transação não encontrada.' });
    }

    // Rejeita a transação
    await Transaction.updateStatus(transactionId, 'cancelled', reason);

    // Devolve o dinheiro para o usuário
    const { query } = require('../config/database');
    await query(
      'UPDATE users SET balance = balance + $1 WHERE id = $2',
      [transaction.amount, transaction.user_id]
    );

    res.json({ message: 'Saque rejeitado e valor devolvido ao usuário.' });
  } catch (error) {
    console.error('Erro ao rejeitar saque:', error);
    res.status(500).json({ message: 'Erro ao rejeitar saque.' });
  }
};

// ==================== GESTÃO DE CUPONS ====================

exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.findAll();
    res.json(coupons);
  } catch (error) {
    console.error('Erro ao buscar cupons:', error);
    res.status(500).json({ message: 'Erro ao buscar cupons.' });
  }
};

exports.createCoupon = async (req, res) => {
  try {
    const { code, type, value, gameId, usageLimit, expiresAt, description } = req.body;

    if (!code || !type || !value) {
      return res.status(400).json({ message: 'Código, tipo e valor são obrigatórios.' });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      type,
      value,
      gameId,
      usageLimit,
      expiresAt,
      description
    });

    res.status(201).json({ message: 'Cupom criado com sucesso!', coupon });
  } catch (error) {
    console.error('Erro ao criar cupom:', error);
    if (error.constraint === 'coupons_code_key') {
      return res.status(400).json({ message: 'Código do cupom já existe.' });
    }
    res.status(500).json({ message: 'Erro ao criar cupom.' });
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    const couponId = req.params.id;
    const { code, type, value, gameId, usageLimit, isActive, expiresAt, description } = req.body;

    const coupon = await Coupon.update(couponId, {
      code: code?.toUpperCase(),
      type,
      value,
      gameId,
      usageLimit,
      isActive,
      expiresAt,
      description
    });

    if (!coupon) {
      return res.status(404).json({ message: 'Cupom não encontrado.' });
    }

    res.json({ message: 'Cupom atualizado com sucesso!', coupon });
  } catch (error) {
    console.error('Erro ao atualizar cupom:', error);
    res.status(500).json({ message: 'Erro ao atualizar cupom.' });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.deleteById(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({ message: 'Cupom não encontrado.' });
    }

    res.json({ message: 'Cupom deletado com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar cupom:', error);
    res.status(500).json({ message: 'Erro ao deletar cupom.' });
  }
};

// ==================== RELATÓRIOS ====================

exports.getDashboardStats = async (req, res) => {
  try {
    const totalStats = await UserPlay.getTotalStats();
    const recentWinners = await UserPlay.getRecentWinners(5);
    const popularGames = await Game.getPopularGames(5);
    
    // Estatísticas financeiras dos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const revenueReport = await Transaction.getRevenueReport(
      thirtyDaysAgo.toISOString(),
      new Date().toISOString()
    );

    const { rows: userCount } = await require('../config/database').query(
      'SELECT COUNT(*) as total FROM users WHERE role = $1',
      ['player']
    );

    res.json({
      totalStats,
      recentWinners,
      popularGames,
      revenueReport,
      totalUsers: userCount[0].total
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ message: 'Erro ao buscar estatísticas.' });
  }
};

// ==================== RELATÓRIOS (CORRIGIDO) ====================

exports.getDashboardStats = async (req, res) => {
  try {
    console.log('📊 Buscando estatísticas do dashboard...');
    
    // Buscar cada estatística separadamente para identificar onde está o erro
    let totalStats = null;
    let recentWinners = [];
    let popularGames = [];
    let totalUsers = 0;

    // 1. Estatísticas totais
    try {
      totalStats = await UserPlay.getTotalStats();
      console.log('✅ Estatísticas totais obtidas:', totalStats);
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas totais:', error);
      totalStats = {
        total_games_played: 0,
        total_players: 0,
        total_bets: 0,
        total_prizes: 0,
        total_wins: 0,
        avg_bet_amount: 0
      };
    }

    // 2. Ganhadores recentes
    try {
      recentWinners = await UserPlay.getRecentWinners(5);
      console.log('✅ Ganhadores recentes obtidos:', recentWinners.length);
    } catch (error) {
      console.error('❌ Erro ao buscar ganhadores recentes:', error);
      recentWinners = [];
    }

    // 3. Jogos populares
    try {
      popularGames = await Game.getPopularGames(5);
      console.log('✅ Jogos populares obtidos:', popularGames.length);
    } catch (error) {
      console.error('❌ Erro ao buscar jogos populares:', error);
      popularGames = [];
    }

    // 4. Total de usuários
    try {
      const { rows: userCount } = await require('../config/database').query(
        'SELECT COUNT(*) as total FROM users WHERE role = ?',
        ['player']
      );
      totalUsers = userCount[0]?.total || 0;
      console.log('✅ Total de usuários obtido:', totalUsers);
    } catch (error) {
      console.error('❌ Erro ao buscar total de usuários:', error);
      totalUsers = 0;
    }

    // 5. Relatório de receita (opcional)
    let revenueReport = [];
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      revenueReport = await Transaction.getRevenueReport(
        thirtyDaysAgo.toISOString().split('T')[0],
        new Date().toISOString().split('T')[0]
      );
      console.log('✅ Relatório de receita obtido:', revenueReport.length);
    } catch (error) {
      console.error('❌ Erro ao buscar relatório de receita:', error);
      revenueReport = [];
    }

    // Resposta consolidada
    const response = {
      totalStats,
      recentWinners,
      popularGames,
      totalUsers,
      revenueReport
    };

    console.log('✅ Estatísticas do dashboard enviadas com sucesso');
    res.json(response);

  } catch (error) {
    console.error('❌ Erro geral ao buscar estatísticas do dashboard:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar estatísticas.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno'
    });
  }
};

exports.getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Data de início e fim são obrigatórias.' });
    }

    console.log('📊 Gerando relatório de receita...', { startDate, endDate });

    let revenueReport = [];
    let transactionSummary = [];
    let playsByDate = [];

    try {
      revenueReport = await Transaction.getRevenueReport(startDate, endDate);
    } catch (error) {
      console.error('Erro no relatório de receita:', error);
      revenueReport = [];
    }

    try {
      transactionSummary = await Transaction.getTransactionSummary(startDate, endDate);
    } catch (error) {
      console.error('Erro no resumo de transações:', error);
      transactionSummary = [];
    }

    try {
      playsByDate = await UserPlay.getPlaysByDateRange(startDate, endDate);
    } catch (error) {
      console.error('Erro nas jogadas por data:', error);
      playsByDate = [];
    }

    res.json({
      revenueReport,
      transactionSummary,
      playsByDate
    });
  } catch (error) {
    console.error('❌ Erro ao gerar relatório de receita:', error);
    res.status(500).json({ message: 'Erro ao gerar relatório de receita.' });
  }
};

exports.getGamePerformanceReport = async (req, res) => {
  try {
    console.log('📊 Gerando relatório de performance dos jogos...');
    
    const { rows: gamePerformance } = await require('../config/database').query(`
      SELECT 
        g.id,
        g.name,
        g.price,
        g.theme,
        g.rtp,
        COUNT(up.id) as total_plays,
        COUNT(DISTINCT up.user_id) as unique_players,
        COALESCE(SUM(up.amount_bet), 0) as total_revenue,
        COALESCE(SUM(up.prize_won), 0) as total_prizes_paid,
        ROUND((COALESCE(SUM(up.prize_won), 0) / NULLIF(COALESCE(SUM(up.amount_bet), 0), 0)) * 100, 2) as actual_rtp,
        ROUND((COUNT(CASE WHEN up.is_winner = 1 THEN 1 END) / NULLIF(COUNT(up.id), 0)) * 100, 2) as win_rate,
        COALESCE(AVG(up.amount_bet), 0) as avg_bet,
        COALESCE(MAX(up.prize_won), 0) as biggest_win,
        MAX(up.played_at) as last_played
      FROM games g
      LEFT JOIN user_plays up ON g.id = up.game_id
      GROUP BY g.id, g.name, g.price, g.theme, g.rtp
      ORDER BY total_revenue DESC
    `);

    console.log('✅ Relatório de performance gerado:', gamePerformance.length, 'jogos');
    res.json(gamePerformance);
  } catch (error) {
    console.error('❌ Erro ao gerar relatório de performance dos jogos:', error);
    res.status(500).json({ message: 'Erro ao gerar relatório de performance dos jogos.' });
  }
};