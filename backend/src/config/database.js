// Arquivo: backend/src/config/database.js (ATUALIZADO)

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

// Função para criar todas as tabelas necessárias
const initializeDatabase = async () => {
  const createUserTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      balance NUMERIC(10, 2) DEFAULT 0.00,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      role VARCHAR(20) DEFAULT 'player' NOT NULL -- 'player' ou 'admin'
    );
  `;

  const createGameTableQuery = `
    CREATE TABLE IF NOT EXISTS games (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      price NUMERIC(10, 2) NOT NULL,
      theme VARCHAR(50),
      description TEXT,
      rtp NUMERIC(5, 2) DEFAULT 95.00, -- Return to Player percentage
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // Nova tabela de prêmios conforme mencionado nas alterações
  const createPrizeTableQuery = `
    CREATE TABLE IF NOT EXISTS prizes (
      id SERIAL PRIMARY KEY,
      game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
      prize_value NUMERIC(10, 2) NOT NULL,
      probability NUMERIC(8, 6) NOT NULL, -- Probabilidade entre 0 e 1
      multiplier NUMERIC(5, 2) DEFAULT 1.00, -- Multiplicador do valor da aposta
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createTransactionTableQuery = `
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      type VARCHAR(20) NOT NULL, -- 'deposit', 'withdrawal', 'prize', 'game_cost'
      amount NUMERIC(10, 2) NOT NULL,
      status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'cancelled'
      payment_method VARCHAR(50), -- 'credit_card', 'pix', 'bank_transfer'
      external_reference VARCHAR(255), -- ID da transação no gateway de pagamento
      description TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createUserPlaysTableQuery = `
    CREATE TABLE IF NOT EXISTS user_plays (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
      amount_bet NUMERIC(10, 2) NOT NULL,
      prize_won NUMERIC(10, 2) DEFAULT 0.00,
      is_winner BOOLEAN DEFAULT false,
      played_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createCouponTableQuery = `
    CREATE TABLE IF NOT EXISTS coupons (
      id SERIAL PRIMARY KEY,
      code VARCHAR(50) UNIQUE NOT NULL,
      type VARCHAR(20) NOT NULL, -- 'free_game', 'bonus_balance', 'cashback'
      value NUMERIC(10, 2) NOT NULL,
      game_id INTEGER REFERENCES games(id) ON DELETE SET NULL, -- Para cupons de jogo específico
      usage_limit INTEGER DEFAULT 1,
      used_count INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      expires_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createUserCouponTableQuery = `
    CREATE TABLE IF NOT EXISTS user_coupons (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      coupon_id INTEGER REFERENCES coupons(id) ON DELETE CASCADE,
      used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, coupon_id)
    );
  `;

  try {
    const client = await pool.connect();
    
    // Executa todas as queries de criação de tabelas
    await client.query(createUserTableQuery);
    await client.query(createGameTableQuery);
    await client.query(createPrizeTableQuery);
    await client.query(createTransactionTableQuery);
    await client.query(createUserPlaysTableQuery);
    await client.query(createCouponTableQuery);
    await client.query(createUserCouponTableQuery);
    
    // Inserir dados básicos se não existirem
    await seedInitialData(client);
    
    client.release();
    console.log("✅ Todas as tabelas foram verificadas/criadas com sucesso.");
  } catch (err) {
    console.error("❌ Erro ao inicializar o banco de dados:", err);
  }
};

// Função para inserir dados iniciais
const seedInitialData = async (client) => {
  try {
    // Verifica se já existe um admin
    const adminCheck = await client.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    
    if (adminCheck.rows.length === 0) {
      const bcrypt = require('bcryptjs');
      const adminPassword = bcrypt.hashSync('admin123', 10);
      
      await client.query(
        "INSERT INTO users (name, email, password, role, balance) VALUES ($1, $2, $3, $4, $5)",
        ['Administrador', 'admin@raspadinha.com', adminPassword, 'admin', 1000.00]
      );
      console.log("✅ Usuário administrador padrão criado (email: admin@raspadinha.com, senha: admin123)");
    }

    // Verifica se já existem jogos
    const gameCheck = await client.query("SELECT id FROM games LIMIT 1");
    
    if (gameCheck.rows.length === 0) {
      // Insere jogos de exemplo
      const games = [
        ['Raspadinha Clássica', 5.00, 'classic', 'A tradicional raspadinha com símbolos clássicos', 95.00],
        ['Tesouro Pirata', 10.00, 'pirate', 'Encontre o tesouro dos piratas!', 94.50],
        ['Frutas da Sorte', 2.00, 'fruit', 'Combine as frutas e ganhe prêmios', 96.00],
        ['Super Jackpot', 25.00, 'jackpot', 'O maior prêmio está esperando por você!', 92.00]
      ];

      for (const game of games) {
        const result = await client.query(
          "INSERT INTO games (name, price, theme, description, rtp) VALUES ($1, $2, $3, $4, $5) RETURNING id",
          game
        );
        
        const gameId = result.rows[0].id;
        
        // Adiciona prêmios para cada jogo
        const prizes = [
          [gameId, 0, 0.60], // 60% chance de não ganhar nada
          [gameId, game[1] * 2, 0.25], // 25% chance de ganhar 2x
          [gameId, game[1] * 5, 0.10], // 10% chance de ganhar 5x
          [gameId, game[1] * 10, 0.04], // 4% chance de ganhar 10x
          [gameId, game[1] * 50, 0.01] // 1% chance de ganhar 50x
        ];

        for (const prize of prizes) {
          await client.query(
            "INSERT INTO prizes (game_id, prize_value, probability, multiplier) VALUES ($1, $2, $3, $4)",
            [...prize, prize[1] / game[1]]
          );
        }
      }
      console.log("✅ Jogos de exemplo criados com seus respectivos prêmios");
    }

    // Inserir cupons de exemplo
    const couponCheck = await client.query("SELECT id FROM coupons LIMIT 1");
    if (couponCheck.rows.length === 0) {
      const coupons = [
        ['WELCOME10', 'bonus_balance', 10.00, null, 100, 'Bônus de boas-vindas'],
        ['FREEGAME', 'free_game', 5.00, 1, 50, 'Jogo grátis para novos usuários'],
        ['CASHBACK5', 'cashback', 5.00, null, 200, 'Cashback de 5%']
      ];

      for (const coupon of coupons) {
        await client.query(
          "INSERT INTO coupons (code, type, value, game_id, usage_limit, description) VALUES ($1, $2, $3, $4, $5, $6)",
          coupon
        );
      }
      console.log("✅ Cupons de exemplo criados");
    }

  } catch (error) {
    console.error("❌ Erro ao inserir dados iniciais:", error);
  }
};

// Exportamos o pool para ser usado em outras partes do sistema e a função de inicialização
module.exports = {
  query: (text, params) => pool.query(text, params),
  initializeDatabase,
};