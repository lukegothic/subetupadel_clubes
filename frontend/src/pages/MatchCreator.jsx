import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  CircularProgress,
  Paper,
  Avatar,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Card
} from '@mui/material';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import axios from 'axios';
import '../styles/glassmorphism.css';

const MatchCreator = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [playerPool, setPlayerPool] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [matches, setMatches] = useState([
    { id: 'match-1', name: 'Partido 1', players: [], balance: 0 }
  ]);

  // Cargar jugadores disponibles
  useEffect(() => {
    const fetchPlayers = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/players?club_id=${user.club_id}`);
        setPlayerPool(response.data.players);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar jugadores');
        setLoading(false);
      }
    };

    const fetchPendingRequests = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/matches/requests?club_id=${user.club_id}&status=pending`);
        setPendingRequests(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar solicitudes pendientes');
        setLoading(false);
      }
    };

    fetchPlayers();
    fetchPendingRequests();
  }, [user.club_id]);

  // Manejar drag and drop
  const handleDragEnd = (result) => {
    const { source, destination } = result;

    // Si no hay destino o el origen y destino son iguales, no hacer nada
    if (!destination || 
        (source.droppableId === destination.droppableId && 
         source.index === destination.index)) {
      return;
    }

    // Si el origen es el pool de jugadores
    if (source.droppableId === 'player-pool') {
      const player = playerPool[source.index];
      
      // Si el destino es un partido
      if (destination.droppableId.startsWith('match-')) {
        const matchId = destination.droppableId;
        
        // Actualizar el partido con el nuevo jugador
        setMatches(matches.map(match => {
          if (match.id === matchId) {
            // Verificar si el jugador ya está en el partido
            if (match.players.some(p => p.id === player.id)) {
              return match;
            }
            
            // Verificar si el partido ya tiene 4 jugadores
            if (match.players.length >= 4) {
              return match;
            }
            
            // Añadir el jugador al partido
            const updatedPlayers = [...match.players, player];
            
            // Calcular el nuevo equilibrio del partido
            const balance = calculateMatchBalance(updatedPlayers);
            
            return {
              ...match,
              players: updatedPlayers,
              balance
            };
          }
          return match;
        }));
      }
    }
    
    // Si el origen es un partido
    else if (source.droppableId.startsWith('match-')) {
      const sourceMatchId = source.droppableId;
      const sourceMatch = matches.find(m => m.id === sourceMatchId);
      const player = sourceMatch.players[source.index];
      
      // Si el destino es otro partido
      if (destination.droppableId.startsWith('match-') && 
          destination.droppableId !== source.droppableId) {
        const destMatchId = destination.droppableId;
        
        // Actualizar ambos partidos
        setMatches(matches.map(match => {
          // Eliminar del partido origen
          if (match.id === sourceMatchId) {
            const updatedPlayers = match.players.filter((_, index) => index !== source.index);
            const balance = calculateMatchBalance(updatedPlayers);
            
            return {
              ...match,
              players: updatedPlayers,
              balance
            };
          }
          
          // Añadir al partido destino
          if (match.id === destMatchId) {
            // Verificar si el jugador ya está en el partido
            if (match.players.some(p => p.id === player.id)) {
              return match;
            }
            
            // Verificar si el partido ya tiene 4 jugadores
            if (match.players.length >= 4) {
              return match;
            }
            
            // Añadir el jugador al partido
            const updatedPlayers = [...match.players, player];
            const balance = calculateMatchBalance(updatedPlayers);
            
            return {
              ...match,
              players: updatedPlayers,
              balance
            };
          }
          
          return match;
        }));
      }
      
      // Si el destino es el pool de jugadores (devolver al pool)
      else if (destination.droppableId === 'player-pool') {
        // Eliminar del partido
        setMatches(matches.map(match => {
          if (match.id === sourceMatchId) {
            const updatedPlayers = match.players.filter((_, index) => index !== source.index);
            const balance = calculateMatchBalance(updatedPlayers);
            
            return {
              ...match,
              players: updatedPlayers,
              balance
            };
          }
          return match;
        }));
      }
    }
  };

  // Calcular el equilibrio del partido
  const calculateMatchBalance = (players) => {
    if (players.length < 4) return 0;
    
    // Dividir en dos equipos (los dos primeros vs los dos últimos)
    const team1 = players.slice(0, 2);
    const team2 = players.slice(2, 4);
    
    // Calcular nivel promedio de cada equipo
    const team1Skill = team1.reduce((sum, player) => sum + player.trueskill, 0) / team1.length;
    const team2Skill = team2.reduce((sum, player) => sum + player.trueskill, 0) / team2.length;
    
    // Calcular diferencia de nivel
    const skillDifference = Math.abs(team1Skill - team2Skill);
    
    // Convertir a porcentaje de equilibrio (100% = perfectamente equilibrado)
    const balance = Math.max(0, 100 - (skillDifference * 20));
    
    return balance;
  };

  // Añadir un nuevo partido
  const addNewMatch = () => {
    const newMatchId = `match-${matches.length + 1}`;
    setMatches([...matches, { id: newMatchId, name: `Partido ${matches.length + 1}`, players: [], balance: 0 }]);
  };

  // Eliminar un partido
  const removeMatch = (matchId) => {
    setMatches(matches.filter(match => match.id !== matchId));
  };

  // Crear partido en el servidor
  const createMatch = async (match) => {
    if (match.players.length !== 4) {
      setError(`El partido ${match.name} debe tener exactamente 4 jugadores`);
      return;
    }
    
    setLoading(true);
    try {
      // Dividir en dos equipos
      const team1 = match.players.slice(0, 2);
      const team2 = match.players.slice(2, 4);
      
      const response = await axios.post('/api/matches', {
        club_id: user.club_id,
        played_on: new Date().toISOString(),
        team1_players: team1.map(p => p.id),
        team2_players: team2.map(p => p.id)
      });
      
      // Eliminar el partido de la lista local
      setMatches(matches.filter(m => m.id !== match.id));
      
      setLoading(false);
    } catch (err) {
      setError(`Error al crear el partido ${match.name}`);
      setLoading(false);
    }
  };

  // Obtener clase CSS según el equilibrio
  const getBalanceClass = (balance) => {
    if (balance >= 90) return 'very-balanced';
    if (balance >= 70) return 'balanced';
    return '';
  };

  // Obtener icono según el equilibrio
  const getBalanceIcon = (balance) => {
    if (balance >= 90) return <CheckCircleIcon sx={{ color: '#4caf50' }} />;
    if (balance >= 70) return <WarningIcon sx={{ color: '#ff9800' }} />;
    return <ErrorIcon sx={{ color: '#f44336' }} />;
  };

  // Obtener sugerencias de jugadores para un partido
  const getPlayerSuggestions = (match) => {
    if (match.players.length === 4) return [];
    
    // Filtrar jugadores que no están en el partido
    const availablePlayers = playerPool.filter(player => 
      !match.players.some(p => p.id === player.id)
    );
    
    // Si no hay suficientes jugadores para completar el partido, devolver todos
    if (match.players.length + availablePlayers.length < 4) {
      return availablePlayers;
    }
    
    // Calcular compatibilidad de cada jugador disponible
    const playersWithCompatibility = availablePlayers.map(player => {
      // Simular añadir el jugador al partido
      const simulatedPlayers = [...match.players, player];
      
      // Si aún no hay 4 jugadores, no podemos calcular equilibrio real
      if (simulatedPlayers.length < 4) {
        return { ...player, compatibility: 50 }; // Compatibilidad neutral
      }
      
      // Calcular equilibrio con este jugador
      const balance = calculateMatchBalance(simulatedPlayers);
      
      return { ...player, compatibility: balance };
    });
    
    // Ordenar por compatibilidad (mayor primero)
    return playersWithCompatibility.sort((a, b) => b.compatibility - a.compatibility).slice(0, 5);
  };

  return (
    <Container className="matchmaking-container">
      <Box className="glass-container" sx={{ mb: 4, p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold', color: 'white' }}>
          Creador de Partidos
        </Typography>
        <Typography variant="subtitle1" align="center" sx={{ mb: 4, color: 'rgba(255, 255, 255, 0.8)' }}>
          Arrastra jugadores para crear partidos equilibrados
        </Typography>

        {error && (
          <Paper className="glass-card" sx={{ p: 2, mb: 3, bgcolor: 'rgba(244, 67, 54, 0.1)' }}>
            <Typography color="error">{error}</Typography>
          </Paper>
        )}

        <DragDropContext onDragEnd={handleDragEnd}>
          <Grid container spacing={3}>
            {/* Pool de jugadores */}
            <Grid item xs={12} md={4}>
              <Paper className="glass-card" sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                  Jugadores Disponibles
                </Typography>
                
                <Droppable droppableId="player-pool">
                  {(provided) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{ minHeight: '400px' }}
                    >
                      {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                          <CircularProgress />
                        </Box>
                      ) : (
                        playerPool.map((player, index) => (
                          <Draggable
                            key={player.id}
                            draggableId={player.id}
                            index={index}
                          >
                            {(provided) => (
                              <Box
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="player-card"
                                sx={{ mb: 2 }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>
                                    <SportsTennisIcon />
                                  </Avatar>
                                  <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="body1" sx={{ color: 'white' }}>
                                      {player.name}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                      <Chip 
                                        label={`Nivel: ${player.trueskill.toFixed(1)}`} 
                                        size="small"
                                        sx={{ 
                                          bgcolor: 'rgba(255, 255, 255, 0.1)', 
                                          color: 'white',
                                          fontSize: '0.7rem'
                                        }}
                                      />
                                      <Chip 
                                        label={`Lado: ${player.preferred_side}`} 
                                        size="small"
                                        sx={{ 
                                          bgcolor: 'rgba(255, 255, 255, 0.1)', 
                                          color: 'white',
                                          fontSize: '0.7rem'
                                        }}
                                      />
                                    </Box>
                                  </Box>
                                </Box>
                              </Box>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </Paper>
            </Grid>

            {/* Partidos */}
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                {matches.map((match) => (
                  <Grid item xs={12} key={match.id}>
                    <Paper className="glass-card" sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ color: 'white' }}>
                          {match.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {match.players.length === 4 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                              {getBalanceIcon(match.balance)}
                              <Typography variant="body2" sx={{ ml: 1, color: 'rgba(255, 255, 255, 0.7)' }}>
                                Equilibrio: {match.balance.toFixed(0)}%
                              </Typography>
                              <div className={`balance-indicator ${getBalanceClass(match.balance)}`} style={{ width: '50px', marginLeft: '10px' }}></div>
                            </Box>
                          )}
                          <IconButton 
                            size="small" 
                            onClick={() => removeMatch(match.id)}
                            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>

                      <Grid container spacing={2}>
                        {/* Área para soltar jugadores */}
                        <Grid item xs={12}>
                          <Droppable droppableId={match.id}>
                            {(provided) => (
                              <Box
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                sx={{ 
                                  minHeight: '150px', 
                                  border: '1px dashed rgba(255, 255, 255, 0.3)',
                                  borderRadius: '8px',
                                  p: 2
                                }}
                              >
                                <Grid container spacing={1}>
                                  {match.players.map((player, index) => (
                                    <Grid item xs={6} sm={3} key={player.id}>
                                      <Draggable
                                        draggableId={`${match.id}-${player.id}`}
                                        index={index}
                                      >
                                        {(provided) => (
                                          <Box
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className="player-card"
                                          >
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                              <Avatar sx={{ mb: 1, bgcolor: index < 2 ? 'primary.main' : 'secondary.main' }}>
                                                <SportsTennisIcon />
                                              </Avatar>
                                              <Typography variant="body2" sx={{ color: 'white', textAlign: 'center' }}>
                                                {player.name}
                                              </Typography>
                                              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                                Nivel: {player.trueskill.toFixed(1)}
                                              </Typography>
                                              <Chip 
                                                label={`Equipo ${index < 2 ? '1' : '2'}`} 
                                                size="small"
                                                sx={{ 
                                                  mt: 1,
                                                  bgcolor: index < 2 ? 'rgba(25, 118, 210, 0.3)' : 'rgba(245, 0, 87, 0.3)', 
                                                  color: 'white',
                                                  fontSize: '0.7rem'
                                                }}
                                              />
                                            </Box>
                                          </Box>
                                        )}
                                      </Draggable>
                                    </Grid>
                                  ))}
                                  {provided.placeholder}
                                </Grid>
                                
                                {match.players.length === 0 && (
                                  <Typography 
                                    variant="body2" 
                                    align="center" 
                                    sx={{ color: 'rgba(255, 255, 255, 0.5)', mt: 2 }}
                                  >
                                    Arrastra jugadores aquí para crear un partido
                                  </Typography>
                                )}
                              </Box>
                            )}
                          </Droppable>
                        </Grid>

                        {/* Sugerencias de jugadores */}
                        {match.players.length > 0 && match.players.length < 4 && (
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" sx={{ color: 'white', mt: 2, mb: 1 }}>
                              Sugerencias para completar el partido:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {getPlayerSuggestions(match).map((player) => (
                                <Tooltip 
                                  key={player.id} 
                                  title={`Compatibilidad: ${player.compatibility.toFixed(0)}%`}
                                >
                                  <Chip
                                    avatar={<Avatar><SportsTennisIcon /></Avatar>}
                                    label={player.name}
                                    onClick={() => {
                                      // Simular drag and drop
                                      const updatedPlayers = [...match.players, player];
                                      const balance = calculateMatchBalance(updatedPlayers);
                                      
                                      setMatches(matches.map(m => {
                                        if (m.id === match.id) {
                                          return {
                                            ...m,
                                            players: updatedPlayers,
                                            balance
                                          };
                                        }
                                        return m;
                                      }));
                                    }}
                                    sx={{ 
                                      bgcolor: 'rgba(255, 255, 255, 0.1)', 
                                      color: 'white',
                                      '&:hover': {
                                        bgcolor: 'rgba(255, 255, 255, 0.2)'
                                      }
                                    }}
                                  />
                                </Tooltip>
                              ))}
                            </Box>
                          </Grid>
                        )}

                        {/* Botones de acción */}
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            {match.players.length === 4 && (
                              <Button
                                variant="contained"
                                onClick={() => createMatch(match)}
                                disabled={loading}
                                sx={{
                                  backgroundColor: 'rgba(25, 118, 210, 0.7)',
                                  '&:hover': {
                                    backgroundColor: 'rgba(25, 118, 210, 0.9)'
                                  }
                                }}
                              >
                                Crear Partido
                              </Button>
                            )}
                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                ))}

                {/* Botón para añadir nuevo partido */}
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={addNewMatch}
                    fullWidth
                    sx={{
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                      }
                    }}
                  >
                    Añadir Nuevo Partido
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DragDropContext>
      </Box>
    </Container>
  );
};

export default MatchCreator;
