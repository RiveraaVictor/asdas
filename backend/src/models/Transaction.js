// Arquivo: backend/src/models/Transaction.js (CORRIGIDO PARA MYSQL)

const db = require('../config/database');

const create = async ({ userId, type, amount, status = 'pending', paymentMethod, externalReference, description }) => {
  const { rows } = await db.query(
    `INSERT INTO transactions (user_id, type, amount, status, payment_method, external_reference, description) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, type, amount, status, paymentMethod, externalReference, description]
  );
  
  // MySQL retorna insertId
  const insertId = rows.insertId;
  
  // Buscar o registro inserido
  const { rows: inserted } = await db.query(
    'SELECT * FROM transactions WHERE id = ?',
    [insertId]
  );
  
  return inserted[0];
};

const findById = async (id) => {
  const { rows } = await db.query('SELECT * FROM transactions WHERE id = ?', [id]);
  return rows[0];
};

const findByUserId = async (userId, limit = 50, offset = 0) => {
  const { rows } = await db.query(
    'SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [userId, parseInt(limit), parseInt(offset)]
  );
  return rows;
};

const findAll = async (limit = 100, offset = 0, filters = {}) => {
  let query = 'SELECT t.*, u.name as user_name, u.email as user_email FROM transactions t JOIN users u ON t.user_id = u.id';
  let params = [];
  let whereConditions = [];

  // Aplicar filtros
  if (filters.type) {
    whereConditions.push(`t.type = ?`);
    params.push(filters.type);
  }

  if (filters.status) {
    whereConditions.push(`t.status = ?`);
    params.push(filters.status);
  }

  if (filters.startDate) {
    whereConditions.push(`t.created_at >= ?`);
    params.push(filters.startDate);
  }

  if (filters.endDate) {
    whereConditions.push(`t.created_at <= ?`);
    params.push(filters.endDate);
  }

  if (whereConditions.length > 0) {
    query += ' WHERE ' + whereConditions.join(' AND ');
  }

  query += ` ORDER BY t.created_at DESC LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), parseInt(offset));

  const { rows } = await db.query(query, params);
  return rows;
};

const updateStatus = async (id, status, externalReference = null) => {
  const { rows } = await db.query(
    'UPDATE transactions SET status = ?, external_reference = ?, updated_at = NOW() WHERE id = ?',
    [status, externalReference, id]
  );
  
  // Buscar o registro atualizado
  return await findById(id);
};

const getPendingWithdrawals = async () => {
  const { rows } = await db.query(
    `SELECT t.*, u.name as user_name, u.email as user_email 
     FROM transactions t 
     JOIN users u ON t.user_id = u.id 
     WHERE t.type = 'withdrawal' AND t.status = 'pending' 
     ORDER BY t.created_at ASC`
  );
  return rows;
};

// Relatórios
const getTransactionSummary = async (startDate, endDate) => {
  try {
    const { rows } = await db.query(
      `SELECT 
         type,
         status,
         COUNT(*) as count,
         COALESCE(SUM(amount), 0) as total_amount
       FROM transactions 
       WHERE created_at BETWEEN ? AND ?
       GROUP BY type, status
       ORDER BY type, status`,
      [startDate, endDate]
    );
    return rows;
  } catch (error) {
    console.error('Erro ao buscar resumo de transações:', error);
    return [];
  }
};

const getRevenueReport = async (startDate, endDate) => {
  try {
    const { rows } = await db.query(
      `SELECT 
         DATE(created_at) as date,
         COALESCE(SUM(CASE WHEN type = 'deposit' AND status = 'completed' THEN amount ELSE 0 END), 0) as deposits,
         COALESCE(SUM(CASE WHEN type = 'withdrawal' AND status = 'completed' THEN amount ELSE 0 END), 0) as withdrawals,
         COALESCE(SUM(CASE WHEN type = 'game_cost' THEN amount ELSE 0 END), 0) as game_revenue,
         COALESCE(SUM(CASE WHEN type = 'prize' THEN amount ELSE 0 END), 0) as prizes_paid
       FROM transactions 
       WHERE created_at BETWEEN ? AND ?
       GROUP BY DATE(created_at)
       ORDER BY date DESC`,
      [startDate, endDate]
    );
    return rows;
  } catch (error) {
    console.error('Erro ao buscar relatório de receita:', error);
    return [];
  }
};

module.exports = {
  create,
  findById,
  findByUserId,
  findAll,
  updateStatus,
  getPendingWithdrawals,
  getTransactionSummary,
  getRevenueReport
};