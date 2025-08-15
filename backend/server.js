// Arquivo: backend/server.js

const express = require('express');
const cors = require('cors'); // 1. Importe o pacote cors
require('dotenv').config();

// Importa a função de inicialização da base de dados
const { initializeDatabase } = require('./src/config/database');

// Importe os seus ficheiros de rotas
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const gameRoutes = require('./src/routes/gameRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

const app = express();

// =================================================================
// 2. APLIQUE O MIDDLEWARE DE CORS AQUI (O PASSO MAIS IMPORTANTE)
// Configuração explícita para permitir requisições do seu frontend
const corsOptions = {
  origin: 'http://localhost:3000', // Endereço do seu frontend React
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
// =================================================================

// Middlewares para processar JSON
app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
  res.send('API da Raspadinha iGame está no ar!');
});

// Registe as suas rotas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/admin', adminRoutes);

// Middleware para tratamento de rotas não encontradas (404)
app.use((req, res, next) => {
  res.status(404).send("Desculpe, a rota que você procura não foi encontrada.");
});

// Middleware para tratamento de erros global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo correu mal no servidor!');
});


const PORT = process.env.PORT || 8000; // A porta do backend

// Inicia o servidor e a base de dados
app.listen(PORT, async () => {
  console.log(`🚀 Servidor a correr na porta ${PORT}`);
  try {
    // Chama a função de inicialização da base de dados
    await initializeDatabase();
    console.log('✅ Base de dados inicializada com sucesso!');
  } catch (error) {
    console.error('❌ Falha ao inicializar a base de dados:', error);
    process.exit(1); // Encerra a aplicação se a base de dados falhar
  }
});
