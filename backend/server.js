// Arquivo: backend/server.js (ATUALIZADO)

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initializeDatabase } = require('./src/config/database');

// Importar todas as rotas
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const gameRoutes = require('./src/routes/gameRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Middleware para log de requisições (desenvolvimento)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rota de health check
app.get('/', (req, res) => {
  res.json({
    message: 'API da Raspadinha iGame está no ar! 🎮',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Configurar todas as rotas
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/admin', adminRoutes);

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Rota não encontrada',
    path: req.originalUrl
  });
});

// Middleware global de tratamento de erros
app.use((error, req, res, next) => {
  console.error('Erro não tratado:', error);
  res.status(500).json({
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {
  console.log(`\n🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log('\n📊 Rotas disponíveis:');
  console.log('   • Auth: /api/auth/*');
  console.log('   • Usuário: /api/user/*');
  console.log('   • Jogos: /api/games/*');
  console.log('   • Admin: /api/admin/*');
  console.log('\n🔧 Inicializando banco de dados...');
  
  try {
    await initializeDatabase();
    console.log('✅ Banco de dados inicializado com sucesso!');
    console.log('\n🎯 API pronta para uso!');
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
  }
});