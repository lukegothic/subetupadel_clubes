import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Avatar,
  Chip,
  CircularProgress,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import { fetchPlayersStart, fetchPlayersSuccess, fetchPlayersFailure } from '../store/slices/playerSlice';
import axios from 'axios';
import '../styles/glassmorphism.css';

const Players = () => {
  const dispatch = useDispatch();
  const { players, loading, error, totalPages, currentPage } = useSelector(state => state.players);
  const { user } = useSelector(state => state.auth);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    minLevel: '',
    maxLevel: '',
    gender: '',
    preferredSide: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    fetchPlayers(1);
  }, []);
  
  const fetchPlayers = async (page = currentPage, search = searchTerm, filterParams = filters) => {
    dispatch(fetchPlayersStart());
    
    try {
      const params = {
        club_id: user.club_id,
        page,
        limit: 10,
        search
      };
      
      // Añadir filtros si están definidos
      if (filterParams.minLevel) params.min_level = filterParams.minLevel;
      if (filterParams.maxLevel) params.max_level = filterParams.maxLevel;
      if (filterParams.gender) params.gender = filterParams.gender;
      if (filterParams.preferredSide) params.preferred_side = filterParams.preferredSide;
      
      const response = await axios.get('/api/players', { params });
      
      dispatch(fetchPlayersSuccess({
        players: response.data.players,
        totalPages: response.data.totalPages,
        currentPage: page
      }));
    } catch (error) {
      dispatch(fetchPlayersFailure(
        error.response?.data?.message || 'Error al cargar jugadores'
      ));
    }
  };
  
  const handleSearch = () => {
    fetchPlayers(1, searchTerm);
  };
  
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };
  
  const applyFilters = () => {
    fetchPlayers(1, searchTerm, filters);
  };
  
  const resetFilters = () => {
    setFilters({
      minLevel: '',
      maxLevel: '',
      gender: '',
      preferredSide: ''
    });
    fetchPlayers(1, searchTerm, {
      minLevel: '',
      maxLevel: '',
      gender: '',
      preferredSide: ''
    });
  };
  
  const handlePageChange = (event, value) => {
    fetchPlayers(value);
  };
  
  const getLevelColor = (level) => {
    if (level >= 20) return '#4caf50';
    if (level >= 15) return '#8bc34a';
    if (level >= 10) return '#cddc39';
    if (level >= 5) return '#ffc107';
    return '#ff9800';
  };

  return (
    <Container className="matchmaking-container">
      <Box className="glass-container" sx={{ mb: 4, p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold', color: 'white' }}>
          Gestión de Jugadores
        </Typography>
        <Typography variant="subtitle1" align="center" sx={{ mb: 4, color: 'rgba(255, 255, 255, 0.8)' }}>
          Visualiza y gestiona los jugadores de tu club
        </Typography>
        
        <Paper className="glass-card" sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Buscar jugadores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleSearch} edge="end" sx={{ color: 'white' }}>
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: {
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.7)',
                    }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => setShowFilters(!showFilters)}
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
              </Button>
            </Grid>
            
            {showFilters && (
              <Grid item xs={12}>
                <Box sx={{ mt: 2, p: 2, border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Nivel Mínimo"
                        type="number"
                        name="minLevel"
                        value={filters.minLevel}
                        onChange={handleFilterChange}
                        InputProps={{
                          sx: {
                            color: 'white',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(255, 255, 255, 0.3)',
                            }
                          }
                        }}
                        InputLabelProps={{
                          sx: { color: 'rgba(255, 255, 255, 0.7)' }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Nivel Máximo"
                        type="number"
                        name="maxLevel"
                        value={filters.maxLevel}
                        onChange={handleFilterChange}
                        InputProps={{
                          sx: {
                            color: 'white',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(255, 255, 255, 0.3)',
                            }
                          }
                        }}
                        InputLabelProps={{
                          sx: { color: 'rgba(255, 255, 255, 0.7)' }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <FormControl fullWidth>
                        <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Género</InputLabel>
                        <Select
                          name="gender"
                          value={filters.gender}
                          onChange={handleFilterChange}
                          sx={{
                            color: 'white',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(255, 255, 255, 0.3)',
                            }
                          }}
                        >
                          <MenuItem value="">Todos</MenuItem>
                          <MenuItem value="male">Masculino</MenuItem>
                          <MenuItem value="female">Femenino</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <FormControl fullWidth>
                        <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Lado Preferido</InputLabel>
                        <Select
                          name="preferredSide"
                          value={filters.preferredSide}
                          onChange={handleFilterChange}
                          sx={{
                            color: 'white',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(255, 255, 255, 0.3)',
                            }
                          }}
                        >
                          <MenuItem value="">Todos</MenuItem>
                          <MenuItem value="right">Derecha</MenuItem>
                          <MenuItem value="left">Izquierda</MenuItem>
                          <MenuItem value="both">Ambos</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 1 }}>
                      <Button
                        variant="outlined"
                        onClick={resetFilters}
                        sx={{
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          color: 'white'
                        }}
                      >
                        Resetear
                      </Button>
                      <Button
                        variant="contained"
                        onClick={applyFilters}
                        sx={{
                          backgroundColor: 'rgba(25, 118, 210, 0.7)',
                          '&:hover': {
                            backgroundColor: 'rgba(25, 118, 210, 0.9)'
                          }
                        }}
                      >
                        Aplicar Filtros
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            )}
          </Grid>
        </Paper>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress sx={{ color: 'white' }} />
          </Box>
        ) : error ? (
          <Paper className="glass-card" sx={{ p: 3, mb: 3, bgcolor: 'rgba(244, 67, 54, 0.1)' }}>
            <Typography color="error">{error}</Typography>
          </Paper>
        ) : (
          <>
            <Grid container spacing={3}>
              {players.map((player) => (
                <Grid item xs={12} sm={6} md={4} key={player.id}>
                  <Paper className="glass-card player-card" sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar 
                        sx={{ 
                          mr: 2, 
                          bgcolor: 'primary.main',
                          width: 60,
                          height: 60
                        }}
                      >
                        <SportsTennisIcon fontSize="large" />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ color: 'white' }}>
                          {player.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {player.email}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Divider sx={{ my: 2, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
                    
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Nivel:
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="h6" sx={{ color: 'white', mr: 1 }}>
                            {player.trueskill.toFixed(1)}
                          </Typography>
                          <Box 
                            sx={{ 
                              width: 12, 
                              height: 12, 
                              borderRadius: '50%', 
                              bgcolor: getLevelColor(player.trueskill) 
                            }} 
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Género:
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'white' }}>
                          {player.gender === 'male' ? 'Masculino' : 'Femenino'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Lado Preferido:
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'white' }}>
                          {player.preferred_side === 'right' ? 'Derecha' : 
                           player.preferred_side === 'left' ? 'Izquierda' : 'Ambos'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Partidos:
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'white' }}>
                          {player.matches_played || 0}
                        </Typography>
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <Chip 
                        label={`Victorias: ${player.wins || 0}`} 
                        size="small"
                        sx={{ 
                          bgcolor: 'rgba(76, 175, 80, 0.2)', 
                          color: 'white'
                        }}
                      />
                      <Chip 
                        label={`Derrotas: ${player.losses || 0}`} 
                        size="small"
                        sx={{ 
                          bgcolor: 'rgba(244, 67, 54, 0.2)', 
                          color: 'white'
                        }}
                      />
                      <Chip 
                        label={`Ratio: ${player.win_ratio ? player.win_ratio.toFixed(2) : '0.00'}`} 
                        size="small"
                        sx={{ 
                          bgcolor: 'rgba(33, 150, 243, 0.2)', 
                          color: 'white'
                        }}
                      />
                    </Box>
                    
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                      <Button
                        variant="outlined"
                        onClick={() => navigate(`/players/${player.id}`)}
                        sx={{
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          color: 'white',
                          '&:hover': {
                            borderColor: 'rgba(255, 255, 255, 0.5)',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)'
                          }
                        }}
                      >
                        Ver Perfil
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
            
            {players.length === 0 && (
              <Paper className="glass-card" sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ color: 'white' }}>
                  No se encontraron jugadores
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 1 }}>
                  Intenta con otros filtros o términos de búsqueda
                </Typography>
              </Paper>
            )}
            
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination 
                  count={totalPages} 
                  page={currentPage} 
                  onChange={handlePageChange}
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: 'white',
                    },
                    '& .MuiPaginationItem-page.Mui-selected': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    }
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </Container>
  );
};

export default Players;
