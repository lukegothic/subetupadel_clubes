import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  CircularProgress, 
  Button,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import { useSelector } from 'react-redux';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const MatchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector(state => state.auth);
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMatchDetail = async () => {
      try {
        const response = await fetch(`/api/matches/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Error al cargar los detalles del partido');
        }
        
        const data = await response.json();
        setMatch(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMatchDetail();
  }, [id, token]);

  const handleBack = () => {
    navigate('/matches');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Box>
    );
  }

  if (!match) {
    return (
      <Box p={3}>
        <Typography variant="h6">
          No se encontró el partido
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        sx={{ mb: 3 }}
      >
        Volver a Partidos
      </Button>

      <Typography variant="h4" gutterBottom>
        Detalles del Partido
      </Typography>

      <Grid container spacing={3}>
        {/* Información General */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Información General
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Fecha
                  </Typography>
                  <Typography variant="body1">
                    {new Date(match.date).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Hora
                  </Typography>
                  <Typography variant="body1">
                    {new Date(match.date).toLocaleTimeString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Estado
                  </Typography>
                  <Typography variant="body1">
                    {match.status}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Jugadores */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Jugador 1
              </Typography>
              <Typography variant="body1">
                {match.player1_name}
              </Typography>
              <Typography variant="subtitle2" color="textSecondary">
                Nivel: {match.player1_level}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Jugador 2
              </Typography>
              <Typography variant="body1">
                {match.player2_name}
              </Typography>
              <Typography variant="subtitle2" color="textSecondary">
                Nivel: {match.player2_level}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Resultado */}
        {match.result && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Resultado
                </Typography>
                <Typography variant="h4" align="center">
                  {match.result}
                </Typography>
                {match.sets && (
                  <Box mt={2}>
                    <Typography variant="subtitle1" gutterBottom>
                      Sets:
                    </Typography>
                    {match.sets.map((set, index) => (
                      <Typography key={index} variant="body1">
                        Set {index + 1}: {set}
                      </Typography>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Notas */}
        {match.notes && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Notas
                </Typography>
                <Typography variant="body1">
                  {match.notes}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default MatchDetail; 