const Match = require('../models/Match');
const MatchPlayer = require('../models/MatchPlayer');
const Player = require('../models/Player');
const Club = require('../models/Club');
const MatchRequest = require('../models/MatchRequest');
const MatchRequestPlayer = require('../models/MatchRequestPlayer');
const MatchmakingSuggestion = require('../models/MatchmakingSuggestion');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

// Obtener todos los partidos con filtros opcionales
exports.getAllMatches = async (req, res) => {
  try {
    const { 
      club_id, 
      from_date, 
      to_date, 
      is_validated,
      page = 1, 
      limit = 20 
    } = req.query;
    
    const whereClause = {};
    
    // Aplicar filtros si están presentes
    if (club_id) whereClause.club_id = club_id;
    if (is_validated !== undefined) whereClause.is_result_validated = is_validated === 'true';
    
    if (from_date || to_date) {
      whereClause.played_on = {};
      if (from_date) whereClause.played_on[Op.gte] = new Date(from_date);
      if (to_date) whereClause.played_on[Op.lte] = new Date(to_date);
    }
    
    const offset = (page - 1) * limit;
    
    const matches = await Match.findAndCountAll({
      where: whereClause,
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
    console.error('Error al obtener partidos:', error);
    res.status(500).json({ message: 'Error al obtener partidos', error: error.message });
  }
};

// Obtener un partido por ID
exports.getMatchById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const match = await Match.findByPk(id);
    
    if (!match) {
      return res.status(404).json({ message: 'Partido no encontrado' });
    }
    
    // Obtener los jugadores del partido
    const matchPlayers = await MatchPlayer.findAll({
      where: { match_id: id },
      include: [{ model: Player }]
    });
    
    // Organizar jugadores por equipos
    const teams = {
      team1: matchPlayers.filter(mp => mp.team_id === 1).map(mp => mp.Player),
      team2: matchPlayers.filter(mp => mp.team_id === 2).map(mp => mp.Player)
    };
    
    res.status(200).json({
      ...match.toJSON(),
      teams
    });
  } catch (error) {
    console.error('Error al obtener partido:', error);
    res.status(500).json({ message: 'Error al obtener partido', error: error.message });
  }
};

// Crear un partido (flujo reactivo - a partir de una solicitud)
exports.createMatchFromRequest = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { match_request_id, played_on, club_id } = req.body;
    
    // Verificar que la solicitud existe
    const matchRequest = await MatchRequest.findByPk(match_request_id, {
      include: [{ model: MatchRequestPlayer, as: 'players', include: [{ model: Player }] }]
    });
    
    if (!matchRequest) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Solicitud de partido no encontrada' });
    }
    
    // Verificar que hay 4 jugadores confirmados
    const confirmedPlayers = matchRequest.players.filter(p => p.status === 'confirmed');
    
    if (confirmedPlayers.length !== 4) {
      await transaction.rollback();
      return res.status(400).json({ 
        message: 'No hay suficientes jugadores confirmados', 
        confirmed: confirmedPlayers.length 
      });
    }
    
    // Crear el partido
    const match = await Match.create({
      id: uuidv4(),
      is_result_validated: false,
      played_on: played_on || new Date(),
      created_by_id: matchRequest.requested_by_id,
      club_id: club_id || matchRequest.club_id
    }, { transaction });
    
    // Asignar jugadores a equipos (2 jugadores por equipo)
    // Aquí podríamos implementar lógica más compleja para equilibrar equipos
    const team1Players = confirmedPlayers.slice(0, 2);
    const team2Players = confirmedPlayers.slice(2, 4);
    
    // Crear relaciones match_players
    for (const player of team1Players) {
      await MatchPlayer.create({
        match_id: match.id,
        player_id: player.player_id,
        team_id: 1
      }, { transaction });
    }
    
    for (const player of team2Players) {
      await MatchPlayer.create({
        match_id: match.id,
        player_id: player.player_id,
        team_id: 2
      }, { transaction });
    }
    
    // Actualizar la solicitud para referenciar al partido creado
    await matchRequest.update({
      status: 'completed',
      match_id: match.id
    }, { transaction });
    
    await transaction.commit();
    
    res.status(201).json({
      message: 'Partido creado exitosamente',
      match_id: match.id
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al crear partido:', error);
    res.status(500).json({ message: 'Error al crear partido', error: error.message });
  }
};

// Crear una solicitud de partido (flujo reactivo - inicio)
exports.createMatchRequest = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { club_id, requested_by_id, preferred_date, notes, initial_players } = req.body;
    
    // Verificar que el club existe
    const club = await Club.findByPk(club_id);
    
    if (!club) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Club no encontrado' });
    }
    
    // Verificar que el jugador solicitante existe
    const requestingPlayer = await Player.findByPk(requested_by_id);
    
    if (!requestingPlayer) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Jugador solicitante no encontrado' });
    }
    
    // Crear la solicitud de partido
    const matchRequest = await MatchRequest.create({
      id: uuidv4(),
      club_id,
      requested_by_id,
      status: 'pending',
      preferred_date: preferred_date ? new Date(preferred_date) : null,
      notes
    }, { transaction });
    
    // Si se proporcionan jugadores iniciales, añadirlos a la solicitud
    if (initial_players && Array.isArray(initial_players)) {
      for (const playerId of initial_players) {
        // Verificar que el jugador existe
        const player = await Player.findByPk(playerId);
        
        if (player) {
          await MatchRequestPlayer.create({
            match_request_id: matchRequest.id,
            player_id: playerId,
            status: 'invited'
          }, { transaction });
        }
      }
    }
    
    await transaction.commit();
    
    res.status(201).json({
      message: 'Solicitud de partido creada exitosamente',
      match_request_id: matchRequest.id
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al crear solicitud de partido:', error);
    res.status(500).json({ message: 'Error al crear solicitud de partido', error: error.message });
  }
};

// Actualizar estado de un jugador en una solicitud de partido
exports.updateMatchRequestPlayer = async (req, res) => {
  try {
    const { match_request_id, player_id } = req.params;
    const { status } = req.body;
    
    // Verificar que la relación existe
    const matchRequestPlayer = await MatchRequestPlayer.findOne({
      where: {
        match_request_id,
        player_id
      }
    });
    
    if (!matchRequestPlayer) {
      return res.status(404).json({ message: 'Jugador no encontrado en la solicitud de partido' });
    }
    
    // Actualizar el estado
    await matchRequestPlayer.update({ status });
    
    res.status(200).json({
      message: 'Estado del jugador actualizado exitosamente',
      match_request_id,
      player_id,
      status
    });
  } catch (error) {
    console.error('Error al actualizar estado del jugador:', error);
    res.status(500).json({ message: 'Error al actualizar estado del jugador', error: error.message });
  }
};

// Añadir un jugador a una solicitud de partido
exports.addPlayerToMatchRequest = async (req, res) => {
  try {
    const { match_request_id } = req.params;
    const { player_id, status = 'invited' } = req.body;
    
    // Verificar que la solicitud existe
    const matchRequest = await MatchRequest.findByPk(match_request_id);
    
    if (!matchRequest) {
      return res.status(404).json({ message: 'Solicitud de partido no encontrada' });
    }
    
    // Verificar que el jugador existe
    const player = await Player.findByPk(player_id);
    
    if (!player) {
      return res.status(404).json({ message: 'Jugador no encontrado' });
    }
    
    // Verificar que el jugador no está ya en la solicitud
    const existingPlayer = await MatchRequestPlayer.findOne({
      where: {
        match_request_id,
        player_id
      }
    });
    
    if (existingPlayer) {
      return res.status(400).json({ message: 'El jugador ya está en la solicitud de partido' });
    }
    
    // Añadir el jugador a la solicitud
    await MatchRequestPlayer.create({
      match_request_id,
      player_id,
      status
    });
    
    res.status(201).json({
      message: 'Jugador añadido exitosamente a la solicitud de partido',
      match_request_id,
      player_id,
      status
    });
  } catch (error) {
    console.error('Error al añadir jugador a la solicitud:', error);
    res.status(500).json({ message: 'Error al añadir jugador a la solicitud', error: error.message });
  }
};

// Generar sugerencias de matchmaking (flujo proactivo - "botón mágico")
exports.generateMatchmakingSuggestions = async (req, res) => {
  try {
    const { club_id, min_skill_difference, max_skill_difference, consider_preferred_side, consider_gender } = req.body;
    
    // Verificar que el club existe
    const club = await Club.findByPk(club_id);
    
    if (!club) {
      return res.status(404).json({ message: 'Club no encontrado' });
    }
    
    // Obtener jugadores del club con suficientes partidos para TrueSkill
    const players = await Player.findAll({
      where: {
        club_id,
        matches_played: { [Op.gte]: 10 } // Solo jugadores con suficientes partidos
      },
      order: [['trueskill', 'DESC']]
    });
    
    if (players.length < 4) {
      return res.status(400).json({ 
        message: 'No hay suficientes jugadores con partidos para generar sugerencias',
        available_players: players.length
      });
    }
    
    // Algoritmo simple de matchmaking para generar combinaciones de 4 jugadores
    const suggestions = [];
    
    // Implementación básica: agrupar jugadores de nivel similar
    // En una implementación real, este algoritmo sería mucho más sofisticado
    for (let i = 0; i < players.length - 3; i++) {
      for (let j = i + 1; j < players.length - 2; j++) {
        for (let k = j + 1; k < players.length - 1; k++) {
          for (let l = k + 1; l < players.length; l++) {
            const player1 = players[i];
            const player2 = players[j];
            const player3 = players[k];
            const player4 = players[l];
            
            // Calcular habilidad de los equipos (equipo 1: jugadores 1 y 2, equipo 2: jugadores 3 y 4)
            const team1Skill = (player1.trueskill + player2.trueskill) / 2;
            const team2Skill = (player3.trueskill + player4.trueskill) / 2;
            
            // Calcular diferencia de habilidad
            const skillDifference = Math.abs(team1Skill - team2Skill);
            
            // Verificar si la diferencia está dentro del rango aceptable
            if (skillDifference >= (min_skill_difference || 0) && skillDifference <= (max_skill_difference || 5)) {
              // Calcular puntuación de equilibrio (100 = perfectamente equilibrado, 0 = muy desequilibrado)
              const balanceScore = 100 - (skillDifference * 20); // Simple fórmula lineal
              
              // Verificar compatibilidad de lado preferido si se solicita
              let sideCompatible = true;
              if (consider_preferred_side) {
                // Lógica simplificada: al menos un jugador por equipo debería preferir cada lado
                const team1Sides = [player1.preferred_side, player2.preferred_side];
                const team2Sides = [player3.preferred_side, player4.preferred_side];
                
                sideCompatible = (
                  team1Sides.includes('right') && team1Sides.includes('left') ||
                  team1Sides.includes('both') ||
                  team2Sides.includes('right') && team2Sides.includes('left') ||
                  team2Sides.includes('both')
                );
              }
              
              // Verificar compatibilidad de género si se solicita
              let genderCompatible = true;
              if (consider_gender) {
                // Lógica simplificada: equipos mixtos o del mismo género
                const team1Genders = [player1.sex, player2.sex];
                const team2Genders = [player3.sex, player4.sex];
                
                genderCompatible = (
                  (team1Genders[0] === team1Genders[1]) && (team2Genders[0] === team2Genders[1]) ||
                  (team1Genders.includes('male') && team1Genders.includes('female')) &&
                  (team2Genders.includes('male') && team2Genders.includes('female'))
                );
              }
              
              // Si pasa todos los filtros, añadir a sugerencias
              if (sideCompatible && genderCompatible) {
                suggestions.push({
                  player1_id: player1.id,
                  player2_id: player2.id,
                  player3_id: player3.id,
                  player4_id: player4.id,
                  team1_skill,
                  team2_skill,
                  balance_score
                });
              }
              
              // Limitar a 10 sugerencias para no sobrecargar
              if (suggestions.length >= 10) break;
            }
          }
          if (suggestions.length >= 10) break;
        }
        if (suggestions.length >= 10) break;
      }
      if (suggestions.length >= 10) break;
    }
    
    // Guardar las sugerencias en la base de datos
    const savedSuggestions = [];
    
    for (const suggestion of suggestions) {
      const savedSuggestion = await MatchmakingSuggestion.create({
        id: uuidv4(),
        club_id,
        ...suggestion,
        status: 'pending'
      });
      
      savedSuggestions.push(savedSuggestion);
    }
    
    res.status(200).json({
      message: 'Sugerencias de matchmaking generadas exitosamente',
      count: savedSuggestions.length,
      suggestions: savedSuggestions
    });
  } catch (error) {
    console.error('Error al generar sugerencias de matchmaking:', error);
    res.status(500).json({ message: 'Error al generar sugerencias de matchmaking', error: error.message });
  }
};

// Aceptar una sugerencia de matchmaking y crear un partido
exports.acceptMatchmakingSuggestion = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { suggestion_id } = req.params;
    const { played_on } = req.body;
    
    // Verificar que la sugerencia existe
    const suggestion = await MatchmakingSuggestion.findByPk(suggestion_id);
    
    if (!suggestion) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Sugerencia de matchmaking no encontrada' });
    }
    
    // Verificar que la sugerencia está pendiente
    if (suggestion.status !== 'pending') {
      await transaction.rollback();
      return res.status(400).json({ message: 'La sugerencia ya ha sido procesada' });
    }
    
    // Crear el partido
    const match = await Match.create({
      id: uuidv4(),
      is_result_validated: false,
      played_on: played_on || new Date(),
      created_by_id: req.user.id, // ID del administrador que acepta la sugerencia
      club_id: suggestion.club_id
    }, { transaction });
    
    // Asignar jugadores a equipos según la sugerencia
    await MatchPlayer.create({
      match_id: match.id,
      player_id: suggestion.player1_id,
      team_id: 1
    }, { transaction });
    
    await MatchPlayer.create({
      match_id: match.id,
      player_id: suggestion.player2_id,
      team_id: 1
    }, { transaction });
    
    await MatchPlayer.create({
      match_id: match.id,
      player_id: suggestion.player3_id,
      team_id: 2
    }, { transaction });
    
    await MatchPlayer.create({
      match_id: match.id,
      player_id: suggestion.player4_id,
      team_id: 2
    }, { transaction });
    
    // Actualizar la sugerencia para referenciar al partido creado
    await suggestion.update({
      status: 'accepted',
      match_id: match.id
    }, { transaction });
    
    await transaction.commit();
    
    res.status(200).json({
      message: 'Sugerencia aceptada y partido creado exitosamente',
      match_id: match.id
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al aceptar sugerencia de matchmaking:', error);
    res.status(500).json({ message: 'Error al aceptar sugerencia de matchmaking', error: error.message });
  }
};

// Rechazar una sugerencia de matchmaking
exports.rejectMatchmakingSuggestion = async (req, res) => {
  try {
    const { suggestion_id } = req.params;
    
    // Verificar que la sugerencia existe
    const suggestion = await MatchmakingSuggestion.findByPk(suggestion_id);
    
    if (!suggestion) {
      return res.status(404).json({ message: 'Sugerencia de matchmaking no encontrada' });
    }
    
    // Verificar que la sugerencia está pendiente
    if (suggestion.status !== 'pending') {
      return res.status(400).json({ message: 'La sugerencia ya ha sido procesada' });
    }
    
    // Actualizar la sugerencia a rechazada
    await suggestion.update({
      status: 'rejected'
    });
    
    res.status(200).json({
      message: 'Sugerencia rechazada exitosamente',
      suggestion_id
    });
  } catch (error) {
    console.error('Error al rechazar sugerencia de matchmaking:', error);
    res.status(500).json({ message: 'Error al rechazar sugerencia de matchmaking', error: error.message });
  }
};
