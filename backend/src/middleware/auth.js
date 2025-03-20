const jwt = require('jsonwebtoken');
const ClubAdmin = require('../models/ClubAdmin');

// Middleware para verificar el token JWT
const authMiddleware = async (req, res, next) => {
  try {
    // Obtener el token del encabezado de autorización
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Acceso no autorizado. Token no proporcionado' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'padel-app-secret');
    
    // Buscar el administrador en la base de datos
    const admin = await ClubAdmin.findByPk(decoded.id);
    
    if (!admin) {
      return res.status(401).json({ message: 'Acceso no autorizado. Usuario no encontrado' });
    }
    
    // Añadir la información del usuario a la solicitud
    req.user = {
      id: admin.id,
      username: admin.username,
      club_id: admin.club_id,
      is_super_admin: admin.is_super_admin
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Acceso no autorizado. Token inválido o expirado' });
    }
    
    console.error('Error en middleware de autenticación:', error);
    res.status(500).json({ message: 'Error en autenticación', error: error.message });
  }
};

module.exports = authMiddleware;
