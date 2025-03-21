import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Grid, 
  CircularProgress, 
  Button,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { useSelector } from 'react-redux';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GroupIcon from '@mui/icons-material/Group';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector(state => state.auth);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventDetail = async () => {
      try {
        const response = await fetch(`/api/events/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Error al cargar los detalles del evento');
        }
        
        const data = await response.json();
        setEvent(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetail();
  }, [id, token]);

  const handleBack = () => {
    navigate('/events');
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

  if (!event) {
    return (
      <Box p={3}>
        <Typography variant="h6">
          No se encontró el evento
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
        Volver a Eventos
      </Button>

      <Typography variant="h4" gutterBottom>
        {event.name}
      </Typography>

      <Grid container spacing={3}>
        {/* Información General */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <CalendarTodayIcon color="primary" />
                    <Typography variant="body1">
                      {new Date(event.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <AccessTimeIcon color="primary" />
                    <Typography variant="body1">
                      {new Date(event.date).toLocaleTimeString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <LocationOnIcon color="primary" />
                    <Typography variant="body1">
                      {event.location}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Estado y Tipo */}
        <Grid item xs={12}>
          <Box display="flex" gap={2}>
            <Chip 
              label={event.status} 
              color={event.status === 'active' ? 'success' : 'default'}
              size="large"
            />
            <Chip 
              label={event.type} 
              color="primary"
              size="large"
            />
          </Box>
        </Grid>

        {/* Descripción */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Descripción
              </Typography>
              <Typography variant="body1">
                {event.description}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Participantes */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <GroupIcon color="primary" />
                <Typography variant="h6">
                  Participantes
                </Typography>
              </Box>
              <List>
                {event.participants?.map((participant, index) => (
                  <React.Fragment key={participant.id}>
                    <ListItem>
                      <ListItemText 
                        primary={participant.name}
                        secondary={`Nivel: ${participant.level}`}
                      />
                    </ListItem>
                    {index < event.participants.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Premios */}
        {event.prizes && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <EmojiEventsIcon color="primary" />
                  <Typography variant="h6">
                    Premios
                  </Typography>
                </Box>
                <List>
                  {event.prizes.map((prize, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemText 
                          primary={`${index + 1}º Lugar`}
                          secondary={prize}
                        />
                      </ListItem>
                      {index < event.prizes.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Reglas */}
        {event.rules && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Reglas
                </Typography>
                <List>
                  {event.rules.map((rule, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemText primary={rule} />
                      </ListItem>
                      {index < event.rules.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default EventDetail; 