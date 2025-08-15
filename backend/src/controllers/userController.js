const User = require('../models/User');
const Transaction = require('../models/Transaction');
const UserPlay = require('../models/UserPlay');
const Coupon = require('../models/Coupon');
const { query } = require('../config/database');

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Remove a senha dos dados retornados
    const { password, ...userProfile } = user;
    
    // Busca estatísticas básicas do usuário
    const stats = await UserPlay.getUserStats(userId);

    res.json({
      user: userProfile,
      stats
    });

  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: 'Nome deve ter pelo menos 2 caracteres.' });
    }

    const { rows } = await query(
      'UPDATE users SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, email, balance, role',
      [name.trim(), userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    res.json({
      message: 'Perfil atualizado com sucesso!',
      user: rows[0]
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

exports.getBalance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { rows } = await query('SELECT balance FROM users WHERE id = $1', [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    res.json({
      balance: parseFloat(rows[0].balance)
    });

  } catch (error) {
    console.error('Erro ao buscar saldo:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

exports.getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, type } = req.query;
    const offset = (page - 1) * limit;

    let queryStr = 'SELECT * FROM transactions WHERE user_id = $1';
    let params = [userId];

    if (type) {
      queryStr += ' AND type = $2';
      params.push(type);
    }

    queryStr += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const { rows } = await query(queryStr, params);

    res.json({
      transactions: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: rows.length === parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Erro ao buscar histórico de transações:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

exports.requestWithdrawal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, paymentMethod = 'bank_transfer' } = req.body;

    // Validações
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valor deve ser maior que zero.' });
    }

    if (amount < 10) {
      return res.status(400).json({ message: 'Valor mínimo para saque é R$ 10,00.' });
    }

    // Verifica saldo do usuário
    const user = await User.findById(userId);
    if (user.balance < amount) {
      return res.status(400).json({ message: 'Saldo insuficiente.' });
    }

    // Inicia transação
    await query('BEGIN');

    try {
      // Debita do saldo do usuário
      await query(
        'UPDATE users SET balance = balance - $1 WHERE id = $2',
        [amount, userId]
      );

      // Cria a solicitação de saque
      const withdrawal = await Transaction.create({
        userId,
        type: 'withdrawal',
        amount,
        status: 'pending',
        paymentMethod,
        description: 'Solicitação de saque'
      });

      await query('COMMIT');

      res.status(201).json({
        message: 'Solicitação de saque criada com sucesso! Aguarde a aprovação.',
        withdrawal: {
          id: withdrawal.id,
          amount: withdrawal.amount,
          status: withdrawal.status,
          createdAt: withdrawal.created_at
        }
      });

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Erro ao solicitar saque:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

exports.useCoupon = async (req, res) => {
  try {
    const userId = req.user.id;
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Código do cupom é obrigatório.' });
    }

    // Valida o cupom
    const validation = await Coupon.validateCoupon(code.toUpperCase(), userId);
    
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }

    const coupon = validation.coupon;

    // Inicia transação
    await query('BEGIN');

    try {
      // Aplica o benefício do cupom
      if (coupon.type === 'bonus_balance') {
        // Adiciona saldo
        await query(
          'UPDATE users SET balance = balance + $1 WHERE id = $2',
          [coupon.value, userId]
        );

        // Registra a transação
        await Transaction.create({
          userId,
          type: 'deposit',
          amount: coupon.value,
          status: 'completed',
          description: `Bônus do cupom ${coupon.code}`
        });

      } else if (coupon.type === 'free_game') {
        // Adiciona crédito equivalente ao valor do jogo específico ou valor do cupom
        await query(
          'UPDATE users SET balance = balance + $1 WHERE id = $2',
          [coupon.value, userId]
        );

        await Transaction.create({
          userId,
          type: 'deposit',
          amount: coupon.value,
          status: 'completed',
          description: `Jogo grátis do cupom ${coupon.code}`
        });
      }

      // Marca o cupom como usado
      await Coupon.useCoupon(coupon.id, userId);

      await query('COMMIT');

      res.json({
        message: `Cupom ${coupon.code} aplicado com sucesso!`,
        coupon: {
          type: coupon.type,
          value: coupon.value,
          description: coupon.description
        }
      });

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Erro ao usar cupom:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Busca dados do usuário
    const user = await User.findById(userId);
    const { password, ...userData } = user;
    
    // Estatísticas do usuário
    const stats = await UserPlay.getUserStats(userId);
    
    // Últimas jogadas
    const recentPlays = await UserPlay.findByUserId(userId, 5);
    
    // Últimas transações
    const recentTransactions = await Transaction.findByUserId(userId, 5);
    
    // Saques pendentes
    const { rows: pendingWithdrawals } = await query(
      'SELECT * FROM transactions WHERE user_id = $1 AND type = $2 AND status = $3 ORDER BY created_at DESC',
      [userId, 'withdrawal', 'pending']
    );

    res.json({
      user: userData,
      stats,
      recentPlays,
      recentTransactions,
      pendingWithdrawals
    });

  } catch (error) {
    console.error('Erro ao buscar dashboard:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};