const Player = require('../models/Player');
const Match = require('../models/Match');
const MatchPlayer = require('../models/MatchPlayer');
const PlayerAvailability = require('../models/PlayerAvailability');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

// Obtener todos los jugadores con filtros opcionales
exports.getAllPlayers = async (req, res) => {
  try {
    const { 
      trueskill_min, 
      trueskill_max, 
      matches_min, 
      club_id, 
      preferred_side, 
      gender,
      page = 1, 
      limit = 20 
    } = req.query;
    
    const whereClause = {};
    
    // Aplicar filtros si están presentes
    if (trueskill_min) whereClause.trueskill = { ...whereClause.trueskill, [Op.gte]: parseFloat(trueskill_min) };
    if (trueskill_max) whereClause.trueskill = { ...whereClause.trueskill, [Op.lte]: parseFloat(trueskill_max) };
    if (matches_min) whereClause.matches_played = { [Op.gte]: parseInt(matches_min) };
    if (club_id) whereClause.club_id = club_id;
    if (preferred_side) whereClause.preferred_side = preferred_side;
    if (gender) whereClause.sex = gender;
    
    const offset = (page - 1) * limit;
    
    const players = await Player.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: offset,
      order: [['trueskill', 'DESC']]
    });
    
    res.status(200).json({
      total: players.count,
      totalPages: Math.ceil(players.count / limit),
      currentPage: parseInt(page),
      players: players.rows
    });
  } catch (error) {
    console.error('Error al obtener jugadores:', error);
    res.status(500).json({ message: 'Error al obtener jugadores', error: error.message });
  }
};

// Obtener un jugador por ID
exports.getPlayerById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const player = await Player.findByPk(id);
    
    if (!player) {
      return res.status(404).json({ message: 'Jugador no encontrado' });
    }
    
    res.status(200).json(player);
  } catch (error) {
    console.error('Error al obtener jugador:', error);
    res.status(500).json({ message: 'Error al obtener jugador', error: error.message });
  }
};

// Buscar jugadores por nombre o teléfono
exports.searchPlayers = async (req, res) => {
  try {
    const { query } = req.params;
    
    const players = await Player.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { phone_number: { [Op.iLike]: `%${query}%` } }
        ]
      },
      limit: 20
    });
    
    res.status(200).json(players);
  } catch (error) {
    console.error('Error al buscar jugadores:', error);
    res.status(500).json({ message: 'Error al buscar jugadores', error: error.message });
  }
};

// Obtener partidos de un jugador
exports.getPlayerMatches = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10, page = 1 } = req.query;
    
    const offset = (page - 1) * limit;
    
    // Verificar que el jugador existe
    const player = await Player.findByPk(id);
    
    if (!player) {
      return res.status(404).json({ message: 'Jugador no encontrado' });
    }
    
    // Obtener los IDs de los partidos en los que ha participado el jugador
    const matchPlayers = await MatchPlayer.findAll({
      where: { player_id: id },
      attributes: ['match_id']
    });
    
    const matchIds = matchPlayers.map(mp => mp.match_id);
    
    // Obtener los partidos con esos IDs
    const matches = await Match.findAndCountAll({
      where: { id: { [Op.in]: matchIds } },
      limit: parseInt(limit),
      offset: offset,
      order: [['played_on', 'DESC']]
    });
    
    res.status(200).json({
      total: matches.count,
      totalPages: Math.ceil(matches.count / limit),
      currentPage: parseInt(page),
      matches: matches.rows
    });
  } catch (error) {
    console.error('Error al obtener partidos del jugador:', error);
    res.status(500).json({ message: 'Error al obtener partidos del jugador', error: error.message });
  }
};

// Obtener estadísticas de un jugador
exports.getPlayerStats = async (req, res) => {
  try {
    const { id } = req.params;
    
    const player = await Player.findByPk(id);
    
    if (!player) {
      return res.status(404).json({ message: 'Jugador no encontrado' });
    }
    
    // Calcular estadísticas adicionales
    const winRate = player.matches_played > 0 ? (player.matches_won / player.matches_played) * 100 : 0;
    
    // Obtener la evolución del TrueSkill (esto requeriría una tabla de historial)
    // Para este ejemplo, simplemente devolvemos las estadísticas básicas
    
    const stats = {
      trueskill: player.trueskill,
      mu: player.mu,
      sigma: player.sigma,
      matches_played: player.matches_played,
      matches_won: player.matches_won,
      win_rate: winRate,
      matches_last_ten_result: player.matches_last_ten_result,
      matches_consecutive_wins: player.matches_consecutive_wins,
      matches_consecutive_wins_max: player.matches_consecutive_wins_max
    };
    
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas del jugador:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas del jugador', error: error.message });
  }
};

// Obtener disponibilidad de un jugador
exports.getPlayerAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que el jugador existe
    const player = await Player.findByPk(id);
    
    if (!player) {
      return res.status(404).json({ message: 'Jugador no encontrado' });
    }
    
    // Obtener la disponibilidad del jugador
    const availability = await PlayerAvailability.findAll({
      where: { player_id: id },
      order: [['day_of_week', 'ASC'], ['start_time', 'ASC']]
    });
    
    res.status(200).json(availability);
  } catch (error) {
    console.error('Error al obtener disponibilidad del jugador:', error);
    res.status(500).json({ message: 'Error al obtener disponibilidad del jugador', error: error.message });
  }
};
