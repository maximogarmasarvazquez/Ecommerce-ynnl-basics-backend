const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Validar que el token tenga id y role
    if (!decoded.id || !decoded.role) {
      return res.status(401).json({ error: 'Token inválido: faltan datos' });
    }

    req.user = decoded; // ahora req.user.id y req.user.role están asegurados
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido' });
  }
};

exports.checkRole = (role) => (req, res, next) => {
  if (req.user?.role !== role) {
    return res.status(403).json({ error: 'Acceso denegado: Rol insuficiente' });
  }
  next();
};
