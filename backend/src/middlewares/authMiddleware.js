const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // 1. Pega o token do cabeçalho da requisição
  const authHeader = req.header('Authorization');

  // 2. Verifica se o token não foi enviado
  if (!authHeader) {
    return res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido.' });
  }

  // O formato do token é "Bearer <token>". Precisamos separar.
  const tokenParts = authHeader.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Formato de token inválido.' });
  }
  const token = tokenParts[1];

  try {
    // 3. Verifica se o token é válido
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Se for válido, adiciona o payload do token (com id e role) na requisição
    req.user = decoded;
    next(); // Passa para a próxima função (o controller)
  } catch (ex) {
    res.status(400).json({ message: 'Token inválido.' });
  }
};

