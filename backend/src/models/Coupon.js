// Arquivo: backend/src/models/Coupon.js

const db = require('../config/database');

const findAll = async () => {
  const { rows } = await db.query(
    `SELECT c.*, g.name as game_name 
     FROM coupons c 
     LEFT JOIN games g ON c.game_id = g.id 
     ORDER BY c.created_at DESC`
  );
  return rows;
};

const findById = async (id) => {
  const { rows } = await db.query(
    `SELECT c.*, g.name as game_name 
     FROM coupons c 
     LEFT JOIN games g ON c.game_id = g.id 
     WHERE c.id = $1`,
    [id]
  );
  return rows[0];
};

const findByCode = async (code) => {
  const { rows } = await db.query(
    `SELECT c.*, g.name as game_name 
     FROM coupons c 
     LEFT JOIN games g ON c.game_id = g.id 
     WHERE c.code = $1`,
    [code]
  );
  return rows[0];
};

const create = async ({ code, type, value, gameId, usageLimit, expiresAt, description }) => {
  const { rows } = await db.query(
    `INSERT INTO coupons (code, type, value, game_id, usage_limit, expires_at, description) 
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [code, type, value, gameId, usageLimit, expiresAt, description]
  );
  return rows[0];
};

const update = async (id, { code, type, value, gameId, usageLimit, isActive, expiresAt, description }) => {
  const { rows } = await db.query(
    `UPDATE coupons SET 
       code = $1, type = $2, value = $3, game_id = $4, 
       usage_limit = $5, is_active = $6, expires_at = $7, description = $8
     WHERE id = $9 RETURNING *`,
    [code, type, value, gameId, usageLimit, isActive, expiresAt, description, id]
  );
  return rows[0];
};

const deleteById = async (id) => {
  const { rows } = await db.query('DELETE FROM coupons WHERE id = $1 RETURNING *', [id]);
  return rows[0];
};

const validateCoupon = async (code, userId) => {
  const coupon = await findByCode(code);
  
  if (!coupon) {
    return { valid: false, message: 'Cupom não encontrado.' };
  }

  if (!coupon.is_active) {
    return { valid: false, message: 'Cupom inativo.' };
  }

  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return { valid: false, message: 'Cupom expirado.' };
  }

  if (coupon.used_count >= coupon.usage_limit) {
    return { valid: false, message: 'Cupom esgotado.' };
  }

  // Verifica se o usuário já usou este cupom
  const { rows: userUsage } = await db.query(
    'SELECT id FROM user_coupons WHERE user_id = $1 AND coupon_id = $2',
    [userId, coupon.id]
  );

  if (userUsage.length > 0) {
    return { valid: false, message: 'Você já utilizou este cupom.' };
  }

  return { valid: true, coupon };
};

const useCoupon = async (couponId, userId) => {
  const client = await db.query('BEGIN');
  
  try {
    // Incrementa o contador de uso
    await db.query(
      'UPDATE coupons SET used_count = used_count + 1 WHERE id = $1',
      [couponId]
    );

    // Registra o uso pelo usuário
    await db.query(
      'INSERT INTO user_coupons (user_id, coupon_id) VALUES ($1, $2)',
      [userId, couponId]
    );

    await db.query('COMMIT');
    return true;
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  }
};

const getUsageStats = async (couponId) => {
  const { rows } = await db.query(
    `SELECT 
       c.code,
       c.usage_limit,
       c.used_count,
       COUNT(uc.id) as actual_uses,
       array_agg(u.name) as users_who_used
     FROM coupons c
     LEFT JOIN user_coupons uc ON c.id = uc.coupon_id
     LEFT JOIN users u ON uc.user_id = u.id
     WHERE c.id = $1
     GROUP BY c.id, c.code, c.usage_limit, c.used_count`,
    [couponId]
  );
  return rows[0];
};

module.exports = {
  findAll,
  findById,
  findByCode,
  create,
  update,
  deleteById,
  validateCoupon,
  useCoupon,
  getUsageStats
};