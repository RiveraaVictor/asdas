// Arquivo: backend/src/config/database.js

const { Pool } = require('pg');
require('dotenv').config();

// Cria um "pool" de conexões com as configurações do arquivo .env
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Função para criar a tabela de usuários se ela não existir
const initializeDatabase = async () => {
  const createUserTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      balance NUMERIC(10, 2) DEFAULT 0.00,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      role VARCHAR(20) DEFAULT 'player' NOT NULL -- 'player' ou 'admin'
    );
  `;

   const createGameTableQuery = `
    CREATE TABLE IF NOT EXISTS games (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      price NUMERIC(10, 2) NOT NULL,
      theme VARCHAR(50)
    );
  `;


  try {
    const client = await pool.connect();
    await client.query(createUserTableQuery);
    await client.query(createGameTableQuery); // <-- Execute a nova query
    client.release();
    console.log("Tabelas 'users' e 'games' verificadas/criadas com sucesso.");
  } catch (err) {
    console.error("Erro ao inicializar o banco de dados:", err);
  }
};

// Exportamos o pool para ser usado em outras partes do sistema e a função de inicialização
module.exports = {
  query: (text, params) => pool.query(text, params),
  initializeDatabase,
};