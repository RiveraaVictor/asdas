// Arquivo: backend/src/models/Prize.js

const db = require('../config/database');

const findByGameId = async (gameId) => {
  const { rows } = await db.query('SELECT * FROM prizes WHERE game_id = $1 ORDER BY probability DESC', [gameId]);
  return rows;
};

const create = async ({ gameId, prizeValue, probability, multiplier }) => {
  const { rows } = await db.query(
    'INSERT INTO prizes (game_id, prize_value, probability, multiplier) VALUES ($1, $2, $3, $4) RETURNING *',
    [gameId, prizeValue, probability, multiplier]
  );
  return rows[0];
};

const update = async (id, { prizeValue, probability, multiplier }) => {
  const { rows } = await db.query(
    'UPDATE prizes SET prize_value = $1, probability = $2, multiplier = $3 WHERE id = $4 RETURNING *',
    [prizeValue, probability, multiplier, id]
  );
  return rows[0];
};

const deleteById = async (id) => {
  const { rows } = await db.query('DELETE FROM prizes WHERE id = $1 RETURNING *', [id]);
  return rows[0];
};

// Função para calcular prêmio baseado na probabilidade
const calculatePrize = async (gameId, betAmount) => {
  const prizes = await findByGameId(gameId);
  
  if (prizes.length === 0) {
    return { prizeValue: 0, isWinner: false };
  }

  // Gera um número aleatório entre 0 e 1
  const random = Math.random();
  let cumulativeProbability = 0;

  for (const prize of prizes) {
    cumulativeProbability += parseFloat(prize.probability);
    
    if (random <= cumulativeProbability) {
      return {
        prizeValue: parseFloat(prize.prize_value),
        isWinner: prize.prize_value > 0,
        multiplier: parseFloat(prize.multiplier)
      };
    }
  }

  // Se não achou nenhum prêmio, retorna sem prêmio
  return { prizeValue: 0, isWinner: false, multiplier: 0 };
};

module.exports = {
  findByGameId,
  create,
  update,
  deleteById,
  calculatePrize
};