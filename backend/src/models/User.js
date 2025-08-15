// Arquivo: backend/src/models/User.js

const db = require('../config/database');

// Função para buscar um usuário pelo email
const findByEmail = async (email) => {
  const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0];
};

// Função para criar um novo usuário
const create = async ({ name, email, hashedPassword }) => {
  const { rows } = await db.query(
    'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, balance, role',
    [name, email, hashedPassword]
  );
  return rows[0];
};

const findById = async (id) => {
  const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0];
};

module.exports = {
  findByEmail,
  create,
  findById,
};