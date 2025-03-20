const Event = require('../models/Event');
const Tournament = require('../models/Tournament');
const TournamentMatch = require('../models/TournamentMatch');
const EventParticipant = require('../models/EventParticipant');
const Player = require('../models/Player');
const Club = require('../models/Club');
const Match = require('../models/Match');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

// Obtener todos los eventos con filtros opcionales
exports.getAllEvents = async (req, res) => {
  try {
    const { 
      club_id, 
      type, 
      from_date, 
      to_date,
      page = 1, 
      limit = 20 
    } = req.query;
    
    const whereClause = {};
    
    // Aplicar filtros si están presentes
    if (club_id) whereClause.club_id = club_id;
    if (type) whereClause.type = type;
    
    if (from_date || to_date) {
      whereClause.start_date = {};
      if (from_date) whereClause.start_date[Op.gte] = new Date(from_date);
      if (to_date) whereClause.start_date[Op.lte] = new Date(to_date);
    }
    
    const offset = (page - 1) * limit;
    
    const events = await Event.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: offset,
      order: [['start_date', 'ASC']],
      include: [{ model: Club }]
    });
    
    res.status(200).json({
      total: events.count,
      totalPages: Math.ceil(events.count / limit),
      currentPage: parseInt(page),
      events: events.rows
    });
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    res.status(500).json({ message: 'Error al obtener eventos', error: error.message });
  }
};

// Obtener un evento por ID
exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await Event.findByPk(id, {
      include: [
        { model: Club },
        { 
          model: EventParticipant,
          include: [{ model: Player }]
        }
      ]
    });
    
    if (!event) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }
    
    // Si es un torneo, obtener información adicional
    let tournamentDetails = null;
    if (event.type === 'tournament') {
      tournamentDetails = await Tournament.findByPk(id, {
        include: [
          { 
            model: TournamentMatch,
            include: [{ model: Match }]
          }
        ]
      });
    }
    
    res.status(200).json({
      ...event.toJSON(),
      tournament: tournamentDetails
    });
  } catch (error) {
    console.error('Error al obtener evento:', error);
    res.status(500).json({ message: 'Error al obtener evento', error: error.message });
  }
};

// Crear un nuevo evento
exports.createEvent = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { 
      type, 
      title, 
      description, 
      price, 
      start_date, 
      end_date, 
      registration_deadline, 
      total_slots, 
      club_id,
      tournament_details
    } = req.body;
    
    // Verificar que el club existe
    const club = await Club.findByPk(club_id);
    
    if (!club) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Club no encontrado' });
    }
    
    // Crear el evento
    const eventId = uuidv4();
    const event = await Event.create({
      id: eventId,
      type,
      title,
      description,
      price: parseFloat(price) || 0,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      registration_deadline: new Date(registration_deadline),
      total_slots: parseInt(total_slots),
      club_id
    }, { transaction });
    
    // Si es un torneo, crear la información adicional
    if (type === 'tournament' && tournament_details) {
      await Tournament.create({
        id: eventId,
        format: tournament_details.format || 'knockout',
        rounds: parseInt(tournament_details.rounds) || 1,
        players_per_match: parseInt(tournament_details.players_per_match) || 4
      }, { transaction });
    }
    
    await transaction.commit();
    
    res.status(201).json({
      message: 'Evento creado exitosamente',
      event_id: event.id
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al crear evento:', error);
    res.status(500).json({ message: 'Error al crear evento', error: error.message });
  }
};

// Actualizar un evento existente
exports.updateEvent = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      price, 
      start_date, 
      end_date, 
      registration_deadline, 
      total_slots,
      tournament_details
    } = req.body;
    
    // Verificar que el evento existe
    const event = await Event.findByPk(id);
    
    if (!event) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Evento no encontrado' });
    }
    
    // Actualizar el evento
    await event.update({
      title: title || event.title,
      description: description || event.description,
      price: parseFloat(price) || event.price,
      start_date: start_date ? new Date(start_date) : event.start_date,
      end_date: end_date ? new Date(end_date) : event.end_date,
      registration_deadline: registration_deadline ? new Date(registration_deadline) : event.registration_deadline,
      total_slots: parseInt(total_slots) || event.total_slots
    }, { transaction });
    
    // Si es un torneo, actualizar la información adicional
    if (event.type === 'tournament' && tournament_details) {
      const tournament = await Tournament.findByPk(id);
      
      if (tournament) {
        await tournament.update({
          format: tournament_details.format || tournament.format,
          rounds: parseInt(tournament_details.rounds) || tournament.rounds,
          players_per_match: parseInt(tournament_details.players_per_match) || tournament.players_per_match
        }, { transaction });
      }
    }
    
    await transaction.commit();
    
    res.status(200).json({
      message: 'Evento actualizado exitosamente',
      event_id: event.id
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al actualizar evento:', error);
    res.status(500).json({ message: 'Error al actualizar evento', error: error.message });
  }
};

// Eliminar un evento
exports.deleteEvent = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    // Verificar que el evento existe
    const event = await Event.findByPk(id);
    
    if (!event) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Evento no encontrado' });
    }
    
    // Eliminar el evento (las relaciones se eliminarán en cascada)
    await event.destroy({ transaction });
    
    await transaction.commit();
    
    res.status(200).json({
      message: 'Evento eliminado exitosamente'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al eliminar evento:', error);
    res.status(500).json({ message: 'Error al eliminar evento', error: error.message });
  }
};

// Añadir un participante a un evento
exports.addParticipant = async (req, res) => {
  try {
    const { event_id } = req.params;
    const { player_id, status = 'registered' } = req.body;
    
    // Verificar que el evento existe
    const event = await Event.findByPk(event_id);
    
    if (!event) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }
    
    // Verificar que el jugador existe
    const player = await Player.findByPk(player_id);
    
    if (!player) {
      return res.status(404).json({ message: 'Jugador no encontrado' });
    }
    
    // Verificar si el jugador ya está registrado
    const existingParticipant = await EventParticipant.findOne({
      where: {
        event_id,
        player_id
      }
    });
    
    if (existingParticipant) {
      return res.status(400).json({ message: 'El jugador ya está registrado en este evento' });
    }
    
    // Verificar si hay plazas disponibles
    const participantsCount = await EventParticipant.count({
      where: { event_id }
    });
    
    if (participantsCount >= event.total_slots) {
      return res.status(400).json({ message: 'No hay plazas disponibles para este evento' });
    }
    
    // Añadir el participante
    await EventParticipant.create({
      event_id,
      player_id,
      status
    });
    
    res.status(201).json({
      message: 'Participante añadido exitosamente',
      event_id,
      player_id,
      status
    });
  } catch (error) {
    console.error('Error al añadir participante:', error);
    res.status(500).json({ message: 'Error al añadir participante', error: error.message });
  }
};

// Actualizar el estado de un participante
exports.updateParticipantStatus = async (req, res) => {
  try {
    const { event_id, player_id } = req.params;
    const { status } = req.body;
    
    // Verificar que la relación existe
    const participant = await EventParticipant.findOne({
      where: {
        event_id,
        player_id
      }
    });
    
    if (!participant) {
      return res.status(404).json({ message: 'Participante no encontrado en el evento' });
    }
    
    // Actualizar el estado
    await participant.update({ status });
    
    res.status(200).json({
      message: 'Estado del participante actualizado exitosamente',
      event_id,
      player_id,
      status
    });
  } catch (error) {
    console.error('Error al actualizar estado del participante:', error);
    res.status(500).json({ message: 'Error al actualizar estado del participante', error: error.message });
  }
};

// Eliminar un participante de un evento
exports.removeParticipant = async (req, res) => {
  try {
    const { event_id, player_id } = req.params;
    
    // Verificar que la relación existe
    const participant = await EventParticipant.findOne({
      where: {
        event_id,
        player_id
      }
    });
    
    if (!participant) {
      return res.status(404).json({ message: 'Participante no encontrado en el evento' });
    }
    
    // Eliminar el participante
    await participant.destroy();
    
    res.status(200).json({
      message: 'Participante eliminado exitosamente',
      event_id,
      player_id
    });
  } catch (error) {
    console.error('Error al eliminar participante:', error);
    res.status(500).json({ message: 'Error al eliminar participante', error: error.message });
  }
};

// Generar emparejamientos para un torneo
exports.generateTournamentMatches = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { tournament_id } = req.params;
    
    // Verificar que el torneo existe
    const tournament = await Tournament.findByPk(tournament_id);
    
    if (!tournament) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Torneo no encontrado' });
    }
    
    // Obtener el evento asociado
    const event = await Event.findByPk(tournament_id);
    
    if (!event) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Evento de torneo no encontrado' });
    }
    
    // Obtener los participantes confirmados
    const participants = await EventParticipant.findAll({
      where: {
        event_id: tournament_id,
        status: 'confirmed'
      },
      include: [{ model: Player }]
    });
    
    // Verificar que hay suficientes participantes
    if (participants.length < tournament.players_per_match) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: 'No hay suficientes participantes confirmados para generar emparejamientos',
        confirmed: participants.length,
        required: tournament.players_per_match
      });
    }
    
    // Generar emparejamientos según el formato del torneo
    let matches = [];
    
    if (tournament.format === 'knockout') {
      // Implementación simple para formato de eliminación directa
      // Mezclar aleatoriamente los participantes
      const shuffledParticipants = participants.sort(() => 0.5 - Math.random());
      
      // Calcular el número de partidos en la primera ronda
      const numMatches = Math.floor(shuffledParticipants.length / tournament.players_per_match);
      
      // Crear los partidos de la primera ronda
      for (let i = 0; i < numMatches; i++) {
        const matchPlayers = shuffledParticipants.slice(
          i * tournament.players_per_match, 
          (i + 1) * tournament.players_per_match
        );
        
        // Crear el partido
        const matchId = uuidv4();
        const match = await Match.create({
          id: matchId,
          is_result_validated: false,
          played_on: new Date(event.start_date),
          created_by_id: req.user.id, // ID del administrador que genera los emparejamientos
          club_id: event.club_id
        }, { transaction });
        
        // Asignar jugadores a equipos
        // En este ejemplo simple, dividimos a los jugadores en dos equipos iguales
        const halfPoint = Math.ceil(matchPlayers.length / 2);
        
        for (let j = 0; j < matchPlayers.length; j++) {
          const teamId = j < halfPoint ? 1 : 2;
          await sequelize.models.MatchPlayer.create({
            match_id: matchId,
            player_id: matchPlayers[j].player_id,
            team_id: teamId
          }, { transaction });
        }
        
        // Crear la relación con el torneo
        await TournamentMatch.create({
          id: uuidv4(),
          tournament_id,
          match_id: matchId,
          round: 1,
          position: i
        }, { transaction });
        
        matches.push({
          match_id: matchId,
          round: 1,
          position: i,
          players: matchPlayers.map(p => p.player_id)
        });
      }
    } else if (tournament.format === 'round-robin') {
      // Implementación para formato de todos contra todos
      // Este es un ejemplo simplificado, una implementación completa sería más compleja
      // ...
    }
    
    await transaction.commit();
    
    res.status(200).json({
      message: 'Emparejamientos generados exitosamente',
      tournament_id,
      matches_count: matches.length,
      matches
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al generar emparejamientos:', error);
    res.status(500).json({ message: 'Error al generar emparejamientos', error: error.message });
  }
};
