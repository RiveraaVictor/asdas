// Arquivo: backend/src/models/Game.js
const db = require('../config/database');

const findAll = async () => {
  const { rows } = await db.query('SELECT * FROM games');
  return rows;
};

const findById = async (id) => {
  const { rows } = await db.query('SELECT * FROM games WHERE id = $1', [id]);
  return rows[0];
};


module.exports = { findAll, findById };