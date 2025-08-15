// Arquivo: backend/src/models/UserPlay.js (CORRIGIDO PARA MYSQL)

const db = require('../config/database');

const create = async ({ userId, gameId, amountBet, prizeWon, isWinner }) => {
  const { rows } = await db.query(
    'INSERT INTO user_plays (user_id, game_id, amount_bet, prize_won, is_winner) VALUES (?, ?, ?, ?, ?)',
    [userId, gameId, amountBet, prizeWon, isWinner]
  );
  
  // Para MySQL, o ID é retornado diferente
  const insertId = rows.insertId;
  
  // Buscar o registro inserido
  const { rows: inserted } = await db.query(
    'SELECT * FROM user_plays WHERE id = ?',
    [insertId]
  );
  
  return inserted[0];
};

const findByUserId = async (userId, limit = 50, offset = 0) => {
  const { rows } = await db.query(
    `SELECT up.*, g.name as game_name, g.theme 
     FROM user_plays up 
     JOIN games g ON up.game_id = g.id 
     WHERE up.user_id = ? 
     ORDER BY up.played_at DESC 
     LIMIT ? OFFSET ?`,
    [userId, parseInt(limit), parseInt(offset)]
  );
  return rows;
};

const findByGameId = async (gameId, limit = 100, offset = 0) => {
  const { rows } = await db.query(
    `SELECT up.*, u.name as user_name 
     FROM user_plays up 
     JOIN users u ON up.user_id = u.id 
     WHERE up.game_id = ? 
     ORDER BY up.played_at DESC 
     LIMIT ? OFFSET ?`,
    [gameId, parseInt(limit), parseInt(offset)]
  );
  return rows;
};

const getUserStats = async (userId) => {
  try {
    const { rows } = await db.query(
      `SELECT 
         COUNT(*) as total_games,
         COALESCE(SUM(amount_bet), 0) as total_bet,
         COALESCE(SUM(prize_won), 0) as total_won,
         SUM(CASE WHEN is_winner = 1 THEN 1 ELSE 0 END) as games_won,
         COALESCE(AVG(amount_bet), 0) as avg_bet,
         COALESCE(MAX(prize_won), 0) as biggest_win,
         MIN(played_at) as first_game,
         MAX(played_at) as last_game
       FROM user_plays 
       WHERE user_id = ?`,
      [userId]
    );
    
    // Garantir que sempre retorna um objeto válido
    if (rows.length === 0) {
      return {
        total_games: 0,
        total_bet: 0,
        total_won: 0,
        games_won: 0,
        avg_bet: 0,
        biggest_win: 0,
        first_game: null,
        last_game: null
      };
    }
    
    return rows[0];
  } catch (error) {
    console.error('Erro ao buscar estatísticas do usuário:', error);
    return {
      total_games: 0,
      total_bet: 0,
      total_won: 0,
      games_won: 0,
      avg_bet: 0,
      biggest_win: 0,
      first_game: null,
      last_game: null
    };
  }
};

const getGameStats = async (gameId) => {
  try {
    const { rows } = await db.query(
      `SELECT 
         COUNT(*) as total_plays,
         COUNT(DISTINCT user_id) as unique_players,
         COALESCE(SUM(amount_bet), 0) as total_revenue,
         COALESCE(SUM(prize_won), 0) as total_prizes,
         COALESCE(AVG(amount_bet), 0) as avg_bet,
         SUM(CASE WHEN is_winner = 1 THEN 1 ELSE 0 END) as winning_plays,
         ROUND((SUM(CASE WHEN is_winner = 1 THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as win_rate
       FROM user_plays 
       WHERE game_id = ?`,
      [gameId]
    );
    
    if (rows.length === 0) {
      return {
        total_plays: 0,
        unique_players: 0,
        total_revenue: 0,
        total_prizes: 0,
        avg_bet: 0,
        winning_plays: 0,
        win_rate: 0
      };
    }
    
    return rows[0];
  } catch (error) {
    console.error('Erro ao buscar estatísticas do jogo:', error);
    return {
      total_plays: 0,
      unique_players: 0,
      total_revenue: 0,
      total_prizes: 0,
      avg_bet: 0,
      winning_plays: 0,
      win_rate: 0
    };
  }
};

const getRecentWinners = async (limit = 10) => {
  try {
    const { rows } = await db.query(
      `SELECT up.*, u.name as user_name, g.name as game_name 
       FROM user_plays up 
       JOIN users u ON up.user_id = u.id 
       JOIN games g ON up.game_id = g.id 
       WHERE up.is_winner = 1 AND up.prize_won > 0
       ORDER BY up.played_at DESC 
       LIMIT ?`,
      [parseInt(limit)]
    );
    return rows;
  } catch (error) {
    console.error('Erro ao buscar ganhadores recentes:', error);
    return [];
  }
};

const getTotalStats = async () => {
  try {
    const { rows } = await db.query(
      `SELECT 
         COUNT(*) as total_games_played,
         COUNT(DISTINCT user_id) as total_players,
         COALESCE(SUM(amount_bet), 0) as total_bets,
         COALESCE(SUM(prize_won), 0) as total_prizes,
         SUM(CASE WHEN is_winner = 1 THEN 1 ELSE 0 END) as total_wins,
         ROUND(COALESCE(AVG(amount_bet), 0), 2) as avg_bet_amount
       FROM user_plays`
    );
    
    if (rows.length === 0) {
      return {
        total_games_played: 0,
        total_players: 0,
        total_bets: 0,
        total_prizes: 0,
        total_wins: 0,
        avg_bet_amount: 0
      };
    }
    
    return rows[0];
  } catch (error) {
    console.error('Erro ao buscar estatísticas totais:', error);
    return {
      total_games_played: 0,
      total_players: 0,
      total_bets: 0,
      total_prizes: 0,
      total_wins: 0,
      avg_bet_amount: 0
    };
  }
};

const getPlaysByDateRange = async (startDate, endDate) => {
  try {
    const { rows } = await db.query(
      `SELECT 
         DATE(played_at) as date,
         COUNT(*) as games_played,
         COALESCE(SUM(amount_bet), 0) as total_bet,
         COALESCE(SUM(prize_won), 0) as total_won,
         SUM(CASE WHEN is_winner = 1 THEN 1 ELSE 0 END) as games_won
       FROM user_plays 
       WHERE played_at BETWEEN ? AND ?
       GROUP BY DATE(played_at)
       ORDER BY date DESC`,
      [startDate, endDate]
    );
    return rows;
  } catch (error) {
    console.error('Erro ao buscar jogadas por período:', error);
    return [];
  }
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