// Arquivo: backend/src/models/Transaction.js

const db = require('../config/database');

const create = async ({ userId, type, amount, status = 'pending', paymentMethod, externalReference, description }) => {
  const { rows } = await db.query(
    `INSERT INTO transactions (user_id, type, amount, status, payment_method, external_reference, description) 
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [userId, type, amount, status, paymentMethod, externalReference, description]
  );
  return rows[0];
};

const findById = async (id) => {
  const { rows } = await db.query('SELECT * FROM transactions WHERE id = $1', [id]);
  return rows[0];
};

const findByUserId = async (userId, limit = 50, offset = 0) => {
  const { rows } = await db.query(
    'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
    [userId, limit, offset]
  );
  return rows;
};

const findAll = async (limit = 100, offset = 0, filters = {}) => {
  let query = 'SELECT t.*, u.name as user_name, u.email as user_email FROM transactions t JOIN users u ON t.user_id = u.id';
  let params = [];
  let whereConditions = [];

  // Aplicar filtros
  if (filters.type) {
    whereConditions.push(`t.type = $${params.length + 1}`);
    params.push(filters.type);
  }

  if (filters.status) {
    whereConditions.push(`t.status = $${params.length + 1}`);
    params.push(filters.status);
  }

  if (filters.startDate) {
    whereConditions.push(`t.created_at >= $${params.length + 1}`);
    params.push(filters.startDate);
  }

  if (filters.endDate) {
    whereConditions.push(`t.created_at <= $${params.length + 1}`);
    params.push(filters.endDate);
  }

  if (whereConditions.length > 0) {
    query += ' WHERE ' + whereConditions.join(' AND ');
  }

  query += ` ORDER BY t.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const { rows } = await db.query(query, params);
  return rows;
};

const updateStatus = async (id, status, externalReference = null) => {
  const { rows } = await db.query(
    'UPDATE transactions SET status = $1, external_reference = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
    [status, externalReference, id]
  );
  return rows[0];
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
  const { rows } = await db.query(
    `SELECT 
       type,
       status,
       COUNT(*) as count,
       SUM(amount) as total_amount
     FROM transactions 
     WHERE created_at BETWEEN $1 AND $2
     GROUP BY type, status
     ORDER BY type, status`,
    [startDate, endDate]
  );
  return rows;
};

const getRevenueReport = async (startDate, endDate) => {
  const { rows } = await db.query(
    `SELECT 
       DATE(created_at) as date,
       SUM(CASE WHEN type = 'deposit' AND status = 'completed' THEN amount ELSE 0 END) as deposits,
       SUM(CASE WHEN type = 'withdrawal' AND status = 'completed' THEN amount ELSE 0 END) as withdrawals,
       SUM(CASE WHEN type = 'game_cost' THEN amount ELSE 0 END) as game_revenue,
       SUM(CASE WHEN type = 'prize' THEN amount ELSE 0 END) as prizes_paid
     FROM transactions 
     WHERE created_at BETWEEN $1 AND $2
     GROUP BY DATE(created_at)
     ORDER BY date DESC`,
    [startDate, endDate]
  );
  return rows;
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