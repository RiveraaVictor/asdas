module.exports = function (req, res, next) {
  // Este middleware deve ser usado APÓS o authMiddleware
  // que já validou o token e colocou os dados do usuário em req.user

  if (!req.user) {
    return res.status(401).json({ message: 'Acesso negado. Token não encontrado.' });
  }

  // Verifica se o usuário tem role de admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado. Privilégios de administrador necessários.' });
  }

  next(); // Usuário é admin, pode prosseguir
};