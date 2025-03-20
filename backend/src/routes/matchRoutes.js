const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// Controladores
const matchController = require('../controllers/matchController');

// Rutas para partidos
router.get('/', authMiddleware, matchController.getAllMatches);
router.get('/:id', authMiddleware, matchController.getMatchById);
router.post('/from-request', authMiddleware, matchController.createMatchFromRequest);

// Rutas para solicitudes de partidos
router.post('/requests', authMiddleware, matchController.createMatchRequest);
router.put('/requests/:match_request_id/players/:player_id', authMiddleware, matchController.updateMatchRequestPlayer);
router.post('/requests/:match_request_id/players', authMiddleware, matchController.addPlayerToMatchRequest);

// Rutas para matchmaking
router.post('/matchmaking/suggestions', authMiddleware, matchController.generateMatchmakingSuggestions);
router.post('/matchmaking/suggestions/:suggestion_id/accept', authMiddleware, matchController.acceptMatchmakingSuggestion);
router.post('/matchmaking/suggestions/:suggestion_id/reject', authMiddleware, matchController.rejectMatchmakingSuggestion);

module.exports = router;
