const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// Controladores
const eventController = require('../controllers/eventController');

// Rutas para eventos
router.get('/', authMiddleware, eventController.getAllEvents);
router.get('/:id', authMiddleware, eventController.getEventById);
router.post('/', authMiddleware, eventController.createEvent);
router.put('/:id', authMiddleware, eventController.updateEvent);
router.delete('/:id', authMiddleware, eventController.deleteEvent);

// Rutas para participantes de eventos
router.post('/:event_id/participants', authMiddleware, eventController.addParticipant);
router.put('/:event_id/participants/:player_id', authMiddleware, eventController.updateParticipantStatus);
router.delete('/:event_id/participants/:player_id', authMiddleware, eventController.removeParticipant);

// Rutas para torneos
router.post('/:tournament_id/matches/generate', authMiddleware, eventController.generateTournamentMatches);

module.exports = router;
