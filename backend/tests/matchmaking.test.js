import request from 'supertest';
import app from '../src/server';

// Mock de modelos y dependencias
jest.mock('../src/models/Match', () => ({
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn()
}));

jest.mock('../src/models/Player', () => ({
  findAll: jest.fn(),
  findByPk: jest.fn()
}));

jest.mock('../src/models/MatchmakingSuggestion', () => ({
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn()
}));

jest.mock('../src/config/database', () => ({
  sequelize: {
    transaction: jest.fn(() => ({
      commit: jest.fn(),
      rollback: jest.fn()
    }))
  }
}));

const Match = require('../src/models/Match');
const Player = require('../src/models/Player');
const MatchmakingSuggestion = require('../src/models/MatchmakingSuggestion');
const jwt = require('jsonwebtoken');

describe('Matchmaking API', () => {
  let authToken;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Crear token JWT válido para pruebas
    authToken = jwt.sign(
      { id: '1', username: 'testuser', club_id: '1' },
      process.env.JWT_SECRET || 'padel-app-secret',
      { expiresIn: '1h' }
    );
  });

  describe('POST /api/matches/matchmaking/suggestions', () => {
    test('debe generar sugerencias de matchmaking correctamente', async () => {
      // Mock de datos
      const mockPlayers = [
        { id: 'p1', name: 'Jugador 1', trueskill: 15.0, mu: 15.0, sigma: 1.0, preferred_side: 'right', gender: 'male' },
        { id: 'p2', name: 'Jugador 2', trueskill: 16.0, mu: 16.0, sigma: 1.0, preferred_side: 'left', gender: 'male' },
        { id: 'p3', name: 'Jugador 3', trueskill: 16.5, mu: 16.5, sigma: 1.0, preferred_side: 'right', gender: 'female' },
        { id: 'p4', name: 'Jugador 4', trueskill: 15.9, mu: 15.9, sigma: 1.0, preferred_side: 'left', gender: 'female' }
      ];
      
      const mockSuggestion = {
        id: 'sugg1',
        player1_id: 'p1',
        player2_id: 'p2',
        player3_id: 'p3',
        player4_id: 'p4',
        team1_skill: 15.5,
        team2_skill: 16.2,
        balance_score: 85,
        status: 'pending'
      };

      // Configurar mocks
      Player.findAll.mockResolvedValue(mockPlayers);
      MatchmakingSuggestion.create.mockResolvedValue(mockSuggestion);

      // Realizar solicitud
      const response = await request(app)
        .post('/api/matches/matchmaking/suggestions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          club_id: '1',
          min_skill_difference: 2.0,
          max_skill_difference: 5.0,
          consider_preferred_side: true,
          consider_gender: false
        });

      // Verificar respuesta
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('suggestions');
      expect(response.body.suggestions).toBeInstanceOf(Array);
      
      // Verificar que se llamaron los métodos correctos
      expect(Player.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          club_id: '1'
        })
      }));
    });

    test('debe rechazar solicitudes sin autenticación', async () => {
      // Realizar solicitud sin token
      const response = await request(app)
        .post('/api/matches/matchmaking/suggestions')
        .send({
          club_id: '1',
          min_skill_difference: 2.0,
          max_skill_difference: 5.0
        });

      // Verificar respuesta
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/matches/matchmaking/suggestions/:suggestion_id/accept', () => {
    test('debe aceptar una sugerencia de matchmaking correctamente', async () => {
      // Mock de datos
      const mockSuggestion = {
        id: 'sugg1',
        player1_id: 'p1',
        player2_id: 'p2',
        player3_id: 'p3',
        player4_id: 'p4',
        team1_skill: 15.5,
        team2_skill: 16.2,
        balance_score: 85,
        status: 'pending',
        update: jest.fn()
      };
      
      const mockMatch = {
        id: 'match1',
        played_on: new Date(),
        club_id: '1'
      };

      // Configurar mocks
      MatchmakingSuggestion.findByPk.mockResolvedValue(mockSuggestion);
      Match.create.mockResolvedValue(mockMatch);

      // Realizar solicitud
      const response = await request(app)
        .post('/api/matches/matchmaking/suggestions/sugg1/accept')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          played_on: new Date().toISOString()
        });

      // Verificar respuesta
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('match_id', 'match1');
      expect(response.body).toHaveProperty('message', 'Sugerencia aceptada y partido creado');
      
      // Verificar que se llamaron los métodos correctos
      expect(MatchmakingSuggestion.findByPk).toHaveBeenCalledWith('sugg1');
      expect(mockSuggestion.update).toHaveBeenCalledWith({
        status: 'accepted',
        match_id: 'match1'
      });
      expect(Match.create).toHaveBeenCalled();
    });

    test('debe rechazar la aceptación de una sugerencia inexistente', async () => {
      // Configurar mocks
      MatchmakingSuggestion.findByPk.mockResolvedValue(null);

      // Realizar solicitud
      const response = await request(app)
        .post('/api/matches/matchmaking/suggestions/nonexistent/accept')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          played_on: new Date().toISOString()
        });

      // Verificar respuesta
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Sugerencia no encontrada');
    });
  });
});
