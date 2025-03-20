const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// Controladores (se implementarán más adelante)
const playerController = require('../controllers/playerController');

// Rutas para jugadores
router.get('/', authMiddleware, playerController.getAllPlayers);
router.get('/:id', authMiddleware, playerController.getPlayerById);
router.get('/search/:query', authMiddleware, playerController.searchPlayers);
router.get('/:id/matches', authMiddleware, playerController.getPlayerMatches);
router.get('/:id/stats', authMiddleware, playerController.getPlayerStats);
router.get('/:id/availability', authMiddleware, playerController.getPlayerAvailability);

module.exports = router;
