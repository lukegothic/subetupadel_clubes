import request from 'supertest';
import app from '../src/server';
import jwt from 'jsonwebtoken';

// Mock de modelos y dependencias
jest.mock('../src/models/ClubAdmin', () => ({
  findOne: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn()
}));

jest.mock('../src/models/Club', () => ({
  findByPk: jest.fn()
}));

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn()
}));

jest.mock('../src/config/database', () => ({
  sequelize: {
    transaction: jest.fn(() => ({
      commit: jest.fn(),
      rollback: jest.fn()
    }))
  }
}));

const ClubAdmin = require('../src/models/ClubAdmin');
const Club = require('../src/models/Club');
const bcrypt = require('bcrypt');

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    test('debe iniciar sesión correctamente con credenciales válidas', async () => {
      // Mock de datos
      const mockAdmin = {
        id: '1',
        username: 'testuser',
        password: 'hashedpassword',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        club_id: '1',
        is_super_admin: false,
        update: jest.fn(),
        Club: { id: '1', name: 'Test Club' }
      };

      // Configurar mocks
      ClubAdmin.findOne.mockResolvedValue(mockAdmin);
      bcrypt.compare.mockResolvedValue(true);

      // Realizar solicitud
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      // Verificar respuesta
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('admin');
      expect(response.body.admin.username).toBe('testuser');
      expect(response.body.message).toBe('Inicio de sesión exitoso');

      // Verificar que se llamaron los métodos correctos
      expect(ClubAdmin.findOne).toHaveBeenCalledWith({
        where: { username: 'testuser' },
        include: [{ model: Club }]
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
      expect(mockAdmin.update).toHaveBeenCalledWith({
        last_login: expect.any(Date)
      });
    });

    test('debe rechazar el inicio de sesión con credenciales inválidas', async () => {
      // Configurar mocks
      ClubAdmin.findOne.mockResolvedValue(null);

      // Realizar solicitud
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'wronguser',
          password: 'wrongpass'
        });

      // Verificar respuesta
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Credenciales inválidas');
    });

    test('debe rechazar el inicio de sesión con contraseña incorrecta', async () => {
      // Mock de datos
      const mockAdmin = {
        id: '1',
        username: 'testuser',
        password: 'hashedpassword',
        email: 'test@example.com'
      };

      // Configurar mocks
      ClubAdmin.findOne.mockResolvedValue(mockAdmin);
      bcrypt.compare.mockResolvedValue(false);

      // Realizar solicitud
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'wrongpass'
        });

      // Verificar respuesta
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Credenciales inválidas');
    });
  });

  describe('GET /api/auth/profile', () => {
    test('debe obtener el perfil del administrador autenticado', async () => {
      // Mock de datos
      const mockAdmin = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        club_id: '1',
        is_super_admin: false,
        Club: { id: '1', name: 'Test Club' }
      };

      // Configurar mocks
      ClubAdmin.findByPk.mockResolvedValue(mockAdmin);

      // Crear token JWT válido
      const token = jwt.sign(
        { id: '1', username: 'testuser', club_id: '1' },
        process.env.JWT_SECRET || 'stp-clubes-secret',
        { expiresIn: '1h' }
      );

      // Realizar solicitud
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      // Verificar respuesta
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('username', 'testuser');
      expect(response.body).toHaveProperty('email', 'test@example.com');
      expect(response.body).toHaveProperty('club_id', '1');

      // Verificar que se llamaron los métodos correctos
      expect(ClubAdmin.findByPk).toHaveBeenCalledWith('1', {
        include: [{ model: Club }],
        attributes: { exclude: ['password'] }
      });
    });

    test('debe rechazar solicitudes sin token', async () => {
      // Realizar solicitud sin token
      const response = await request(app)
        .get('/api/auth/profile');

      // Verificar respuesta
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Acceso no autorizado. Token no proporcionado');
    });

    test('debe rechazar solicitudes con token inválido', async () => {
      // Realizar solicitud con token inválido
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      // Verificar respuesta
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Acceso no autorizado. Token inválido o expirado');
    });
  });
});
