// Arquivo: backend/src/models/UserPlay.js

const db = require('../config/database');

const create = async ({ userId, gameId, amountBet, prizeWon, isWinner }) => {
  const { rows } = await db.query(
    'INSERT INTO user_plays (user_id, game_id, amount_bet, prize_won, is_winner) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [userId, gameId, amountBet, prizeWon, isWinner]
  );
  return rows[0];
};

const findByUserId = async (userId, limit = 50, offset = 0) => {
  const { rows } = await db.query(
    `SELECT up.*, g.name as game_name, g.theme 
     FROM user_plays up 
     JOIN games g ON up.game_id = g.id 
     WHERE up.user_id = $1 
     ORDER BY up.played_at DESC 
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return rows;
};

const findByGameId = async (gameId, limit = 100, offset = 0) => {
  const { rows } = await db.query(
    `SELECT up.*, u.name as user_name 
     FROM user_plays up 
     JOIN users u ON up.user_id = u.id 
     WHERE up.game_id = $1 
     ORDER BY up.played_at DESC 
     LIMIT $2 OFFSET $3`,
    [gameId, limit, offset]
  );
  return rows;
};

const getUserStats = async (userId) => {
  const { rows } = await db.query(
    `SELECT 
       COUNT(*) as total_games,
       SUM(amount_bet) as total_bet,
       SUM(prize_won) as total_won,
       SUM(CASE WHEN is_winner THEN 1 ELSE 0 END) as games_won,
       AVG(amount_bet) as avg_bet,
       MAX(prize_won) as biggest_win,
       MIN(played_at) as first_game,
       MAX(played_at) as last_game
     FROM user_plays 
     WHERE user_id = $1`,
    [userId]
  );
  return rows[0];
};

const getGameStats = async (gameId) => {
  const { rows } = await db.query(
    `SELECT 
       COUNT(*) as total_plays,
       COUNT(DISTINCT user_id) as unique_players,
       SUM(amount_bet) as total_revenue,
       SUM(prize_won) as total_prizes,
       AVG(amount_bet) as avg_bet,
       SUM(CASE WHEN is_winner THEN 1 ELSE 0 END) as winning_plays,
       ROUND((SUM(CASE WHEN is_winner THEN 1 ELSE 0 END)::numeric / COUNT(*)::numeric) * 100, 2) as win_rate
     FROM user_plays 
     WHERE game_id = $1`,
    [gameId]
  );
  return rows[0];
};

const getRecentWinners = async (limit = 10) => {
  const { rows } = await db.query(
    `SELECT up.*, u.name as user_name, g.name as game_name 
     FROM user_plays up 
     JOIN users u ON up.user_id = u.id 
     JOIN games g ON up.game_id = g.id 
     WHERE up.is_winner = true 
     ORDER BY up.played_at DESC 
     LIMIT $1`,
    [limit]
  );
  return rows;
};

const getTotalStats = async () => {
  const { rows } = await db.query(
    `SELECT 
       COUNT(*) as total_games_played,
       COUNT(DISTINCT user_id) as total_players,
       SUM(amount_bet) as total_bets,
       SUM(prize_won) as total_prizes,
       SUM(CASE WHEN is_winner THEN 1 ELSE 0 END) as total_wins,
       ROUND(AVG(amount_bet), 2) as avg_bet_amount
     FROM user_plays`
  );
  return rows[0];
};

const getPlaysByDateRange = async (startDate, endDate) => {
  const { rows } = await db.query(
    `SELECT 
       DATE(played_at) as date,
       COUNT(*) as games_played,
       SUM(amount_bet) as total_bet,
       SUM(prize_won) as total_won,
       SUM(CASE WHEN is_winner THEN 1 ELSE 0 END) as games_won
     FROM user_plays 
     WHERE played_at BETWEEN $1 AND $2
     GROUP BY DATE(played_at)
     ORDER BY date DESC`,
    [startDate, endDate]
  );
  return rows;
};

module.exports = {
  create,
  findByUserId,
  findByGameId,
  getUserStats,
  getGameStats,
  getRecentWinners,
  getTotalStats,
  getPlaysByDateRange
};