const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Não autenticado' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, name, email }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
}

// Libera a rota só pra quem tem um dos papéis (roles) informados.
// Ex: requireRole('oleo', 'peca') deixa passar óleo e peça, mas barra o gestor.
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user?.role || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Você não tem permissão para fazer isso' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
