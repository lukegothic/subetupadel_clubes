import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  CircularProgress,
  Slider,
  Switch,
  FormControlLabel,
  Divider,
  Paper,
  Avatar
} from '@mui/material';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { 
  generateMatchmakingSuggestionsStart,
  generateMatchmakingSuggestionsSuccess,
  generateMatchmakingSuggestionsFailure,
  acceptMatchmakingSuggestionStart,
  acceptMatchmakingSuggestionSuccess,
  acceptMatchmakingSuggestionFailure,
  rejectMatchmakingSuggestionStart,
  rejectMatchmakingSuggestionSuccess,
  rejectMatchmakingSuggestionFailure
} from '../store/slices/matchSlice';
import axios from 'axios';
import '../styles/glassmorphism.css';

const Matchmaking = () => {
  const dispatch = useDispatch();
  const { matchmakingSuggestions, loading, error } = useSelector(state => state.matches);
  const { user } = useSelector(state => state.auth);
  
  const [settings, setSettings] = useState({
    minSkillDifference: 2.0,
    maxSkillDifference: 5.0,
    considerPreferredSide: true,
    considerGender: false
  });

  const handleSettingsChange = (setting, value) => {
    setSettings({
      ...settings,
      [setting]: value
    });
  };

  const generateSuggestions = async () => {
    dispatch(generateMatchmakingSuggestionsStart());
    
    try {
      const response = await axios.post('/api/matches/matchmaking/suggestions', {
        club_id: user.club_id,
        min_skill_difference: settings.minSkillDifference,
        max_skill_difference: settings.maxSkillDifference,
        consider_preferred_side: settings.considerPreferredSide,
        consider_gender: settings.considerGender
      });
      
      dispatch(generateMatchmakingSuggestionsSuccess(response.data));
    } catch (error) {
      dispatch(generateMatchmakingSuggestionsFailure(
        error.response?.data?.message || 'Error al generar sugerencias'
      ));
    }
  };

  const acceptSuggestion = async (suggestionId) => {
    dispatch(acceptMatchmakingSuggestionStart());
    
    try {
      const response = await axios.post(`/api/matches/matchmaking/suggestions/${suggestionId}/accept`, {
        played_on: new Date().toISOString()
      });
      
      dispatch(acceptMatchmakingSuggestionSuccess({
        suggestion_id: suggestionId,
        match_id: response.data.match_id
      }));
    } catch (error) {
      dispatch(acceptMatchmakingSuggestionFailure(
        error.response?.data?.message || 'Error al aceptar sugerencia'
      ));
    }
  };

  const rejectSuggestion = async (suggestionId) => {
    dispatch(rejectMatchmakingSuggestionStart());
    
    try {
      await axios.post(`/api/matches/matchmaking/suggestions/${suggestionId}/reject`);
      
      dispatch(rejectMatchmakingSuggestionSuccess({
        suggestion_id: suggestionId
      }));
    } catch (error) {
      dispatch(rejectMatchmakingSuggestionFailure(
        error.response?.data?.message || 'Error al rechazar sugerencia'
      ));
    }
  };

  const getBalanceClass = (balanceScore) => {
    if (balanceScore >= 90) return 'very-balanced';
    if (balanceScore >= 70) return 'balanced';
    return '';
  };

  return (
    <Container className="matchmaking-container">
      <Box className="glass-container" sx={{ mb: 4, p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold', color: 'white' }}>
          Sistema de Matchmaking
        </Typography>
        <Typography variant="subtitle1" align="center" sx={{ mb: 4, color: 'rgba(255, 255, 255, 0.8)' }}>
          Genera partidos equilibrados utilizando el algoritmo TrueSkill
        </Typography>

        <Paper className="glass-card" sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
            Configuración de Matchmaking
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography gutterBottom sx={{ color: 'white' }}>
                Diferencia mínima de habilidad: {settings.minSkillDifference.toFixed(1)}
              </Typography>
              <Slider
                value={settings.minSkillDifference}
                onChange={(e, value) => handleSettingsChange('minSkillDifference', value)}
                min={0}
                max={10}
                step={0.5}
                valueLabelDisplay="auto"
                sx={{
                  '& .MuiSlider-thumb': {
                    backgroundColor: 'white',
                  },
                  '& .MuiSlider-track': {
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  },
                  '& .MuiSlider-rail': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography gutterBottom sx={{ color: 'white' }}>
                Diferencia máxima de habilidad: {settings.maxSkillDifference.toFixed(1)}
              </Typography>
              <Slider
                value={settings.maxSkillDifference}
                onChange={(e, value) => handleSettingsChange('maxSkillDifference', value)}
                min={0}
                max={15}
                step={0.5}
                valueLabelDisplay="auto"
                sx={{
                  '& .MuiSlider-thumb': {
                    backgroundColor: 'white',
                  },
                  '& .MuiSlider-track': {
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  },
                  '& .MuiSlider-rail': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.considerPreferredSide}
                    onChange={(e) => handleSettingsChange('considerPreferredSide', e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: 'white',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                      },
                    }}
                  />
                }
                label="Considerar lado preferido"
                sx={{ color: 'white' }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.considerGender}
                    onChange={(e) => handleSettingsChange('considerGender', e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: 'white',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                      },
                    }}
                  />
                }
                label="Considerar género"
                sx={{ color: 'white' }}
              />
            </Grid>
          </Grid>
        </Paper>

        <Box className="magic-button-container">
          <Button
            className="magic-button"
            onClick={generateSuggestions}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
          >
            {loading ? 'Generando...' : 'Botón Mágico'}
          </Button>
        </Box>

        {error && (
          <Typography color="error" align="center" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        {matchmakingSuggestions.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom align="center" sx={{ color: 'white' }}>
              Sugerencias de Partidos
            </Typography>
            
            {matchmakingSuggestions.map((suggestion) => (
              <Paper key={suggestion.id} className="match-suggestion-card" sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ color: 'white' }}>
                        Partido Equilibrado
                      </Typography>
                      <Box>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          Equilibrio: {suggestion.balance_score.toFixed(0)}%
                        </Typography>
                        <div className={`balance-indicator ${getBalanceClass(suggestion.balance_score)}`}></div>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box className="team-container">
                      <Typography variant="subtitle1" gutterBottom sx={{ color: 'white' }}>
                        Equipo 1 - Nivel: {suggestion.team1_skill.toFixed(1)}
                      </Typography>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Box className="player-card" sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>
                              <SportsTennisIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ color: 'white' }}>
                                Jugador 1
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                Nivel: {suggestion.player1?.trueskill?.toFixed(1) || 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box className="player-card" sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>
                              <SportsTennisIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ color: 'white' }}>
                                Jugador 2
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                Nivel: {suggestion.player2?.trueskill?.toFixed(1) || 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box className="team-container">
                      <Typography variant="subtitle1" gutterBottom sx={{ color: 'white' }}>
                        Equipo 2 - Nivel: {suggestion.team2_skill.toFixed(1)}
                      </Typography>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Box className="player-card" sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 1, bgcolor: 'secondary.main' }}>
                              <SportsTennisIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ color: 'white' }}>
                                Jugador 3
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                Nivel: {suggestion.player3?.trueskill?.toFixed(1) || 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box className="player-card" sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 1, bgcolor: 'secondary.main' }}>
                              <SportsTennisIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ color: 'white' }}>
                                Jugador 4
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                Nivel: {suggestion.player4?.trueskill?.toFixed(1) || 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2, backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => rejectSuggestion(suggestion.id)}
                        disabled={suggestion.status !== 'pending' || loading}
                        sx={{
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          color: 'white',
                          '&:hover': {
                            borderColor: 'rgba(255, 255, 255, 0.5)',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)'
                          }
                        }}
                      >
                        Rechazar
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => acceptSuggestion(suggestion.id)}
                        disabled={suggestion.status !== 'pending' || loading}
                        sx={{
                          backgroundColor: 'rgba(25, 118, 210, 0.7)',
                          '&:hover': {
                            backgroundColor: 'rgba(25, 118, 210, 0.9)'
                          }
                        }}
                      >
                        Aceptar
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Matchmaking;
