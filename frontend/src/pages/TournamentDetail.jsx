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
  Divider,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { useSelector } from 'react-redux';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import GroupIcon from '@mui/icons-material/Group';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import PersonIcon from '@mui/icons-material/Person';

const TournamentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector(state => state.auth);
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchTournamentDetail();
  }, [id, token]);

  const fetchTournamentDetail = async () => {
    try {
      const response = await fetch(`/api/tournaments/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar los detalles del torneo');
      }
      
      const data = await response.json();
      setTournament(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/tournaments');
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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

  if (!tournament) {
    return (
      <Box p={3}>
        <Typography variant="h6">
          No se encontró el torneo
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
        Volver a Torneos
      </Button>

      <Typography variant="h4" gutterBottom>
        {tournament.name}
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
                      {new Date(tournament.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <AccessTimeIcon color="primary" />
                    <Typography variant="body1">
                      {new Date(tournament.date).toLocaleTimeString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <LocationOnIcon color="primary" />
                    <Typography variant="body1">
                      {tournament.location}
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
              label={tournament.status} 
              color={tournament.status === 'active' ? 'success' : 'default'}
              size="large"
            />
            <Chip 
              label={tournament.type} 
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
                {tournament.description}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Tabs para diferentes secciones */}
        <Grid item xs={12}>
          <Paper sx={{ mb: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange} centered>
              <Tab label="Participantes" />
              <Tab label="Bracket" />
              <Tab label="Resultados" />
              <Tab label="Reglas" />
            </Tabs>
          </Paper>

          {/* Contenido de las tabs */}
          {activeTab === 0 && (
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <GroupIcon color="primary" />
                  <Typography variant="h6">
                    Participantes ({tournament.participants?.length || 0} / {tournament.max_participants})
                  </Typography>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Nombre</TableCell>
                        <TableCell>Nivel</TableCell>
                        <TableCell>Estado</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tournament.participants?.map((participant) => (
                        <TableRow key={participant.id}>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <PersonIcon color="primary" />
                              {participant.name}
                            </Box>
                          </TableCell>
                          <TableCell>{participant.level}</TableCell>
                          <TableCell>
                            <Chip 
                              label={participant.status} 
                              color={participant.status === 'active' ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}

          {activeTab === 1 && (
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <SportsTennisIcon color="primary" />
                  <Typography variant="h6">
                    Bracket del Torneo
                  </Typography>
                </Box>
                {/* Aquí iría la visualización del bracket */}
                <Typography variant="body1" color="text.secondary">
                  Visualización del bracket en desarrollo...
                </Typography>
              </CardContent>
            </Card>
          )}

          {activeTab === 2 && (
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <EmojiEventsIcon color="primary" />
                  <Typography variant="h6">
                    Resultados
                  </Typography>
                </Box>
                {tournament.results ? (
                  <List>
                    {tournament.results.map((result, index) => (
                      <React.Fragment key={index}>
                        <ListItem>
                          <ListItemText 
                            primary={`${index + 1}º Lugar`}
                            secondary={result}
                          />
                        </ListItem>
                        {index < tournament.results.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    No hay resultados disponibles aún
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 3 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Reglas del Torneo
                </Typography>
                <List>
                  {tournament.rules?.map((rule, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemText primary={rule} />
                      </ListItem>
                      {index < tournament.rules.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default TournamentDetail; 