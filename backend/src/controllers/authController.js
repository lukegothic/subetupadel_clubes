const ClubAdmin = require('../models/ClubAdmin');
const Club = require('../models/Club');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

// Registrar un nuevo administrador de club
exports.register = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { 
      username, 
      password, 
      email, 
      first_name, 
      last_name, 
      club_id, 
      is_super_admin = false 
    } = req.body;
    
    // Verificar que el club existe
    const club = await Club.findByPk(club_id);
    
    if (!club) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Club no encontrado' });
    }
    
    // Verificar que el nombre de usuario no existe
    const existingAdmin = await ClubAdmin.findOne({
      where: {
        [Op.or]: [
          { username },
          { email }
        ]
      }
    });
    
    if (existingAdmin) {
      await transaction.rollback();
      return res.status(400).json({ message: 'El nombre de usuario o email ya está en uso' });
    }
    
    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Crear el administrador
    const admin = await ClubAdmin.create({
      id: uuidv4(),
      username,
      password: hashedPassword,
      email,
      first_name,
      last_name,
      club_id,
      is_super_admin
    }, { transaction });
    
    await transaction.commit();
    
    // Generar token JWT
    const token = jwt.sign(
      { id: admin.id, username: admin.username, club_id: admin.club_id },
      process.env.JWT_SECRET || 'padel-app-secret',
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      message: 'Administrador registrado exitosamente',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        first_name: admin.first_name,
        last_name: admin.last_name,
        club_id: admin.club_id,
        is_super_admin: admin.is_super_admin
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al registrar administrador:', error);
    res.status(500).json({ message: 'Error al registrar administrador', error: error.message });
  }
};

// Iniciar sesión
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Buscar el administrador por nombre de usuario
    const admin = await ClubAdmin.findOne({
      where: { username },
      include: [{ model: Club }]
    });
    
    if (!admin) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    // Verificar la contraseña
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    // Actualizar último inicio de sesión
    await admin.update({
      last_login: new Date()
    });
    
    // Generar token JWT
    const token = jwt.sign(
      { id: admin.id, username: admin.username, club_id: admin.club_id },
      process.env.JWT_SECRET || 'padel-app-secret',
      { expiresIn: '24h' }
    );
    
    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        first_name: admin.first_name,
        last_name: admin.last_name,
        club_id: admin.club_id,
        is_super_admin: admin.is_super_admin,
        club: admin.Club
      }
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
  }
};

// Obtener perfil del administrador actual
exports.getProfile = async (req, res) => {
  try {
    const admin = await ClubAdmin.findByPk(req.user.id, {
      include: [{ model: Club }],
      attributes: { exclude: ['password'] }
    });
    
    if (!admin) {
      return res.status(404).json({ message: 'Administrador no encontrado' });
    }
    
    res.status(200).json(admin);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ message: 'Error al obtener perfil', error: error.message });
  }
};

// Actualizar perfil del administrador
exports.updateProfile = async (req, res) => {
  try {
    const { email, first_name, last_name } = req.body;
    
    const admin = await ClubAdmin.findByPk(req.user.id);
    
    if (!admin) {
      return res.status(404).json({ message: 'Administrador no encontrado' });
    }
    
    // Actualizar campos
    await admin.update({
      email: email || admin.email,
      first_name: first_name || admin.first_name,
      last_name: last_name || admin.last_name
    });
    
    res.status(200).json({
      message: 'Perfil actualizado exitosamente',
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        first_name: admin.first_name,
        last_name: admin.last_name,
        club_id: admin.club_id,
        is_super_admin: admin.is_super_admin
      }
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ message: 'Error al actualizar perfil', error: error.message });
  }
};

// Cambiar contraseña
exports.changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    
    const admin = await ClubAdmin.findByPk(req.user.id);
    
    if (!admin) {
      return res.status(404).json({ message: 'Administrador no encontrado' });
    }
    
    // Verificar la contraseña actual
    const isPasswordValid = await bcrypt.compare(current_password, admin.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Contraseña actual incorrecta' });
    }
    
    // Encriptar la nueva contraseña
    const hashedPassword = await bcrypt.hash(new_password, 10);
    
    // Actualizar la contraseña
    await admin.update({
      password: hashedPassword
    });
    
    res.status(200).json({
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ message: 'Error al cambiar contraseña', error: error.message });
  }
};
