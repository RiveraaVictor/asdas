// Arquivo: backend/src/controllers/userController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');


exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  // Validação simples
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  try {
    // Verifica se o usuário já existe
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'Este e-mail já está em uso.' });
    }

    // Criptografa a senha - Atendendo ao [RNF002]
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Cria o usuário no banco de dados
    const newUser = await User.create({ name, email, hashedPassword });

    // Resposta de sucesso. Não retornamos a senha.
    res.status(201).json({
      message: 'Usuário cadastrado com sucesso!',
      user: newUser,
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
  }

  try {
    // 1. Busca o usuário pelo e-mail
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas.' }); // Mensagem genérica por segurança
    }

    // 2. Compara a senha enviada com a senha hash no banco 
    const isPasswordCorrect = bcrypt.compareSync(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    // 3. Gera o Token JWT se a senha estiver correta 
    const token = jwt.sign(
      { id: user.id, role: user.role }, // Payload: informações que estarão dentro do token
      process.env.JWT_SECRET,           // Chave secreta do .env
      { expiresIn: '8h' }               // Opções (ex: token expira em 8 horas)
    );

    // 4. Retorna o token para o cliente
    res.status(200).json({
      message: 'Login bem-sucedido!',
      token: token,
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

exports.getProfile = async (req, res) => {
    try {
      // O ID do usuário vem do middleware, que o extraiu do token
      const userId = req.user.id;
      // Você precisará de uma função no seu modelo para buscar por ID
      const user = await User.findById(userId); 

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado.' });
      }
      // Não retorne a senha!
      const { password, ...userProfile } = user;
      res.json(userProfile);

    } catch (error) {
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};