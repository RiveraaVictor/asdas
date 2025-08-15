// Arquivo: backend/server.js (versão atualizada)

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initializeDatabase } = require('./src/config/database');
const authRoutes = require('./src/routes/authRoutes'); // <--- IMPORTAR
const userRoutes = require('./src/routes/userRoutes');
const gameRoutes = require('./src/routes/gameRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API da Raspadinha iGame está no ar!');
});

// Usar as rotas de autenticação com o prefixo /api/auth
app.use('/api/auth', authRoutes); // <--- USAR AS ROTAS
app.use('/api/user', userRoutes);
app.use('/api/games', gameRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  initializeDatabase();
});