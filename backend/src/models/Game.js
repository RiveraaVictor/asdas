// Arquivo: backend/src/models/Game.js (ATUALIZADO)
const db = require('../config/database');

const findAll = async (includeInactive = false) => {
  let query = 'SELECT * FROM games';
  if (!includeInactive) {
    query += ' WHERE is_active = true';
  }
  query += ' ORDER BY created_at DESC';
  
  const { rows } = await db.query(query);
  return rows;
};

const findById = async (id) => {
  const { rows } = await db.query('SELECT * FROM games WHERE id = $1', [id]);
  return rows[0];
};

const create = async ({ name, price, theme, description, rtp }) => {
  const { rows } = await db.query(
    'INSERT INTO games (name, price, theme, description, rtp) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [name, price, theme, description, rtp]
  );
  return rows[0];
};

const update = async (id, { name, price, theme, description, rtp, isActive }) => {
  const { rows } = await db.query(
    `UPDATE games SET 
       name = $1, price = $2, theme = $3, description = $4, 
       rtp = $5, is_active = $6, updated_at = CURRENT_TIMESTAMP 
     WHERE id = $7 RETURNING *`,
    [name, price, theme, description, rtp, isActive, id]
  );
  return rows[0];
};

const deleteById = async (id) => {
  const { rows } = await db.query('DELETE FROM games WHERE id = $1 RETURNING *', [id]);
  return rows[0];
};

const toggleActive = async (id) => {
  const { rows } = await db.query(
    'UPDATE games SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
    [id]
  );
  return rows[0];
};

const getGameWithPrizes = async (id) => {
  const game = await findById(id);
  if (!game) return null;

  const { rows: prizes } = await db.query(
    'SELECT * FROM prizes WHERE game_id = $1 ORDER BY probability DESC',
    [id]
  );

  return { ...game, prizes };
};

const getPopularGames = async (limit = 5) => {
  const { rows } = await db.query(
    `SELECT g.*, COUNT(up.id) as play_count, SUM(up.amount_bet) as total_revenue
     FROM games g
     LEFT JOIN user_plays up ON g.id = up.game_id
     WHERE g.is_active = true
     GROUP BY g.id
     ORDER BY play_count DESC, total_revenue DESC
     LIMIT $1`,
    [limit]
  );
  return rows;
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  deleteById,
  toggleActive,
  getGameWithPrizes,
  getPopularGames
};