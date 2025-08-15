// Arquivo: backend/src/config/database.js (VERSÃO PARA MYSQL - CORRIGIDA E COMPLETA)

const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuração da conexão com o banco de dados a partir do .env
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'raspadinha_igame',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Cria o pool de conexões para reutilização e eficiência
const pool = mysql.createPool(dbConfig);

/**
 * Função unificada para executar queries no banco de dados.
 * @param {string} sql - A string da query SQL.
 * @param {Array} params - Os parâmetros para a query (prevenção de SQL Injection).
 * @returns {Promise<object>} Retorna um objeto com a propriedade 'rows'.
 */
const query = async (sql, params = []) => {
  try {
    const [rows] = await pool.execute(sql, params);
    // Para manter a compatibilidade com a estrutura do pg, retornamos um objeto { rows }
    return { rows };
  } catch (error) {
    console.error('❌ Erro na query do banco de dados:', error.message);
    console.error('SQL:', sql);
    console.error('Params:', params);
    throw error; // Lança o erro para ser tratado pela função que chamou
  }
};

/**
 * Função para inserir dados iniciais (admin, jogos, cupons) se o banco estiver vazio.
 */
const seedInitialData = async () => {
  try {
    // 1. Verifica e cria o usuário administrador
    const { rows: adminCheck } = await query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    if (adminCheck.length === 0) {
      const bcrypt = require('bcryptjs');
      const adminPassword = bcrypt.hashSync('admin123', 10);
      await query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        ['Administrador', 'admin@raspadinha.com', adminPassword, 'admin']
      );
      console.log("✅ Usuário administrador criado (admin@raspadinha.com / admin123)");
    }

    // 2. Verifica e cria os jogos de exemplo
    const { rows: gameCheck } = await query("SELECT id FROM games LIMIT 1");
    if (gameCheck.length === 0) {
      console.log("📦 Inserindo jogos de exemplo...");
      const games = [
        ['Raspadinha Clássica', 5.00, 'classic', 'A tradicional raspadinha com símbolos clássicos', 95.00],
        ['Tesouro Pirata', 10.00, 'pirate', 'Encontre o tesouro dos piratas!', 94.50],
        ['Frutas da Sorte', 2.00, 'fruit', 'Combine as frutas e ganhe prêmios', 96.00]
      ];

      for (const game of games) {
        const { rows: result } = await query("INSERT INTO games (name, price, theme, description, rtp) VALUES (?, ?, ?, ?, ?)", game);
        const gameId = result.insertId; // Pega o ID do jogo recém-criado

        // Adiciona prêmios para cada jogo
        const prizes = [
          [gameId, 0, 0.60], // 60% chance de não ganhar nada
          [gameId, game[1] * 2, 0.25], // 25% chance de ganhar 2x
          [gameId, game[1] * 5, 0.10], // 10% chance de ganhar 5x
          [gameId, game[1] * 10, 0.05]  // 5% chance de ganhar 10x
        ];
        for (const prize of prizes) {
          const multiplier = prize[1] > 0 ? prize[1] / game[1] : 0;
          await query("INSERT INTO prizes (game_id, prize_value, probability, multiplier) VALUES (?, ?, ?, ?)", [...prize, multiplier]);
        }
      }
      console.log("✅ Jogos de exemplo criados com prêmios");
    }

    // 3. Verifica e cria os cupons de exemplo
    const { rows: couponCheck } = await query("SELECT id FROM coupons LIMIT 1");
    if (couponCheck.length === 0) {
      const coupons = [
        ['WELCOME10', 'bonus_balance', 10.00, null, 100, 'Bônus de boas-vindas'],
        ['FREEGAME', 'free_game', 5.00, 1, 50, 'Jogo grátis para novos usuários'],
      ];
      for (const coupon of coupons) {
        await query("INSERT INTO coupons (code, type, value, game_id, usage_limit, description) VALUES (?, ?, ?, ?, ?, ?)", coupon);
      }
      console.log("✅ Cupons de exemplo criados");
    }

  } catch (error) {
    console.error("❌ Erro ao inserir dados iniciais:", error);
    throw error;
  }
};

/**
 * Função principal que cria todas as tabelas e insere os dados iniciais.
 */
const initializeDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('🔗 Conexão MySQL estabelecida com sucesso');
    connection.release();

    console.log('📋 Verificando/Criando tabelas...');

    // Executa a criação de cada tabela sequencialmente
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        balance DECIMAL(10, 2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        role VARCHAR(20) DEFAULT 'player' NOT NULL
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS games (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        theme VARCHAR(50),
        description TEXT,
        rtp DECIMAL(5, 2) DEFAULT 95.00,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS prizes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        game_id INT,
        prize_value DECIMAL(10, 2) NOT NULL,
        probability DECIMAL(8, 6) NOT NULL,
        multiplier DECIMAL(5, 2) DEFAULT 1.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        type VARCHAR(20) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        payment_method VARCHAR(50),
        external_reference VARCHAR(255),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS user_plays (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        game_id INT,
        amount_bet DECIMAL(10, 2) NOT NULL,
        prize_won DECIMAL(10, 2) DEFAULT 0.00,
        is_winner BOOLEAN DEFAULT false,
        played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS coupons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        type VARCHAR(20) NOT NULL,
        value DECIMAL(10, 2) NOT NULL,
        game_id INT NULL,
        usage_limit INT DEFAULT 1,
        used_count INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        expires_at TIMESTAMP NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE SET NULL
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS user_coupons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        coupon_id INT,
        used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_coupon (user_id, coupon_id)
      )
    `);

    console.log('✅ Todas as tabelas foram verificadas/criadas.');
    
    // Insere os dados iniciais após garantir que todas as tabelas existem
    await seedInitialData();

  } catch (err) {
    console.error("❌ Erro fatal ao inicializar o banco de dados MySQL:", err.message);
    // Encerra o processo se não conseguir conectar/inicializar o banco
    process.exit(1); 
  }
};

// Exporta as funções para serem usadas em outras partes da aplicação
module.exports = {
  query,
  initializeDatabase
};
