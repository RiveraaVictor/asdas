// Arquivo: backend/src/models/User.js

// 1. IMPORTA a função 'query' do nosso ficheiro de configuração da base de dados
const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * Encontra um utilizador pelo seu endereço de e-mail.
 * @param {string} email - O e-mail do utilizador a ser procurado.
 * @returns {Promise<object|undefined>} O objeto do utilizador ou indefinido se não for encontrado.
 */
const findByEmail = async (email) => {
  // Sintaxe corrigida para MySQL
  const sql = 'SELECT * FROM users WHERE email = ?';
  const { rows } = await query(sql, [email]);
  return rows[0];
};

/**
 * Encontra um utilizador pelo seu ID.
 * @param {number} id - O ID do utilizador a ser procurado.
 * @returns {Promise<object|undefined>} O objeto do utilizador ou indefinido se não for encontrado.
 */
const findById = async (id) => {
  // Sintaxe corrigida para MySQL
  const sql = 'SELECT * FROM users WHERE id = ?';
  const { rows } = await query(sql, [id]);
  return rows[0];
};

/**
 * Cria um novo utilizador no banco de dados.
 * @param {object} userData - Dados do utilizador (name, email, password).
 * @returns {Promise<object>} O objeto do utilizador recém-criado.
 */
const create = async ({ name, email, password }) => {
  const hashedPassword = bcrypt.hashSync(password, 10);
  const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
  
  const { rows: result } = await query(sql, [name, email, hashedPassword]);
  const insertedId = result.insertId;
  
  // Após inserir, busca o utilizador recém-criado para retornar os seus dados
  return await findById(insertedId);
};


// Adicione outras funções do modelo aqui conforme necessário (ex: update, etc.)

module.exports = {
  findByEmail,
  findById,
  create,
};
