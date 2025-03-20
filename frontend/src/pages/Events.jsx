import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PeopleIcon from '@mui/icons-material/People';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import axios from 'axios';
import '../styles/glassmorphism.css';

const Events = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('event'); // 'event' or 'tournament'
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: new Date(),
    end_date: new Date(),
    location: '',
    max_participants: 16,
    type: 'social', // 'social', 'competitive', 'tournament'
    tournament_format: 'single_elimination' // 'single_elimination', 'double_elimination', 'round_robin'
  });
  
  useEffect(() => {
    fetchEvents();
    fetchTournaments();
  }, []);
  
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/events?club_id=${user.club_id}`);
      setEvents(response.data.events);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar eventos');
      setLoading(false);
    }
  };
  
  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/events/tournaments?club_id=${user.club_id}`);
      setTournaments(response.data.tournaments);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar torneos');
      setLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleOpenDialog = (type) => {
    setDialogType(type);
    setFormData({
      name: '',
      description: '',
      start_date: new Date(),
      end_date: new Date(),
      location: '',
      max_participants: 16,
      type: type === 'tournament' ? 'tournament' : 'social',
      tournament_format: 'single_elimination'
    });
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleDateChange = (name, date) => {
    setFormData({
      ...formData,
      [name]: date
    });
  };
  
  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (dialogType === 'tournament') {
        await axios.post('/api/events/tournaments', {
          ...formData,
          club_id: user.club_id
        });
        fetchTournaments();
      } else {
        await axios.post('/api/events', {
          ...formData,
          club_id: user.club_id
        });
        fetchEvents();
      }
      setOpenDialog(false);
      setLoading(false);
    } catch (err) {
      setError(`Error al crear ${dialogType === 'tournament' ? 'torneo' : 'evento'}`);
      setLoading(false);
    }
  };
  
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este evento?')) {
      return;
    }
    
    setLoading(true);
    try {
      await axios.delete(`/api/events/${eventId}`);
      fetchEvents();
      setLoading(false);
    } catch (err) {
      setError('Error al eliminar evento');
      setLoading(false);
    }
  };
  
  const handleDeleteTournament = async (tournamentId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este torneo?')) {
      return;
    }
    
    setLoading(true);
    try {
      await axios.delete(`/api/events/tournaments/${tournamentId}`);
      fetchTournaments();
      setLoading(false);
    } catch (err) {
      setError('Error al eliminar torneo');
      setLoading(false);
    }
  };
  
  const getEventStatusColor = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) {
      return 'rgba(33, 150, 243, 0.7)'; // Próximo
    } else if (now >= start && now <= end) {
      return 'rgba(76, 175, 80, 0.7)'; // En curso
    } else {
      return 'rgba(158, 158, 158, 0.7)'; // Finalizado
    }
  };
  
  const getEventStatusText = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) {
      return 'Próximo';
    } else if (now >= start && now <= end) {
      return 'En curso';
    } else {
      return 'Finalizado';
    }
  };
  
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'dd MMM yyyy HH:mm', { locale: es });
  };

  return (
    <Container className="matchmaking-container">
      <Box className="glass-container" sx={{ mb: 4, p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold', color: 'white' }}>
          Eventos y Torneos
        </Typography>
        <Typography variant="subtitle1" align="center" sx={{ mb: 4, color: 'rgba(255, 255, 255, 0.8)' }}>
          Organiza y gestiona eventos y torneos para tu club
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            centered
            sx={{
              '& .MuiTab-root': { color: 'rgba(255, 255, 255, 0.7)' },
              '& .Mui-selected': { color: 'white' },
              '& .MuiTabs-indicator': { backgroundColor: 'white' }
            }}
          >
            <Tab label="Eventos" icon={<EventIcon />} iconPosition="start" />
            <Tab label="Torneos" icon={<EmojiEventsIcon />} iconPosition="start" />
          </Tabs>
        </Box>
        
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
            {/* Panel de Eventos */}
            {tabValue === 0 && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog('event')}
                    sx={{
                      background: 'linear-gradient(135deg, rgba(255, 153, 0, 0.8), rgba(255, 94, 0, 0.8))',
                      '&:hover': {
                        background: 'linear-gradient(135deg, rgba(255, 153, 0, 0.9), rgba(255, 94, 0, 0.9))'
                      }
                    }}
                  >
                    Crear Evento
                  </Button>
                </Box>
                
                <Grid container spacing={3}>
                  {events.length > 0 ? (
                    events.map((event) => (
                      <Grid item xs={12} sm={6} md={4} key={event.id}>
                        <Card className="glass-card" sx={{ height: '100%' }}>
                          <Box 
                            sx={{ 
                              height: 8, 
                              backgroundColor: getEventStatusColor(event.start_date, event.end_date) 
                            }} 
                          />
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Typography variant="h6" component="h2" sx={{ color: 'white' }}>
                                {event.name}
                              </Typography>
                              <Chip 
                                label={getEventStatusText(event.start_date, event.end_date)} 
                                size="small"
                                sx={{ 
                                  bgcolor: getEventStatusColor(event.start_date, event.end_date), 
                                  color: 'white'
                                }}
                              />
                            </Box>
                            
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 1, mb: 2 }}>
                              {event.description}
                            </Typography>
                            
                            <Grid container spacing={2}>
                              <Grid item xs={12}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <CalendarTodayIcon sx={{ color: 'rgba(255, 255, 255, 0.7)', mr: 1, fontSize: 20 }} />
                                  <Typography variant="body2" sx={{ color: 'white' }}>
                                    {formatDate(event.start_date)} - {formatDate(event.end_date)}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={12}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <PeopleIcon sx={{ color: 'rgba(255, 255, 255, 0.7)', mr: 1, fontSize: 20 }} />
                                  <Typography variant="body2" sx={{ color: 'white' }}>
                                    {event.participants_count || 0} / {event.max_participants} participantes
                                  </Typography>
                                </Box>
                              </Grid>
                            </Grid>
                          </CardContent>
                          <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {/* Navegar a detalles */}}
                              sx={{
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                color: 'white',
                                '&:hover': {
                                  borderColor: 'rgba(255, 255, 255, 0.5)',
                                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                }
                              }}
                            >
                              Ver Detalles
                            </Button>
                            <Box>
                              <IconButton 
                                size="small" 
                                onClick={() => {/* Editar evento */}}
                                sx={{ color: 'rgba(255, 255, 255, 0.7)', mr: 1 }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                onClick={() => handleDeleteEvent(event.id)}
                                sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Paper className="glass-card" sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ color: 'white' }}>
                          No hay eventos programados
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 1 }}>
                          Crea un nuevo evento para comenzar
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </>
            )}
            
            {/* Panel de Torneos */}
            {tabValue === 1 && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog('tournament')}
                    sx={{
                      background: 'linear-gradient(135deg, rgba(255, 153, 0, 0.8), rgba(255, 94, 0, 0.8))',
                      '&:hover': {
                        background: 'linear-gradient(135deg, rgba(255, 153, 0, 0.9), rgba(255, 94, 0, 0.9))'
                      }
                    }}
                  >
                    Crear Torneo
                  </Button>
                </Box>
                
                <Grid container spacing={3}>
                  {tournaments.length > 0 ? (
                    tournaments.map((tournament) => (
                      <Grid item xs={12} sm={6} md={4} key={tournament.id}>
                        <Card className="glass-card" sx={{ height: '100%' }}>
                          <Box 
                            sx={{ 
                              height: 8, 
                              backgroundColor: getEventStatusColor(tournament.start_date, tournament.end_date) 
                            }} 
                          />
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Typography variant="h6" component="h2" sx={{ color: 'white' }}>
                                {tournament.name}
                              </Typography>
                              <Chip 
                                label={getEventStatusText(tournament.start_date, tournament.end_date)} 
                                size="small"
                                sx={{ 
                                  bgcolor: getEventStatusColor(tournament.start_date, tournament.end_date), 
                                  color: 'white'
                                }}
                              />
                            </Box>
                            
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 1, mb: 2 }}>
                              {tournament.description}
                            </Typography>
                            
                            <Grid container spacing={2}>
                              <Grid item xs={12}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <CalendarTodayIcon sx={{ color: 'rgba(255, 255, 255, 0.7)', mr: 1, fontSize: 20 }} />
                                  <Typography variant="body2" sx={{ color: 'white' }}>
                                    {formatDate(tournament.start_date)} - {formatDate(tournament.end_date)}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={12}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <PeopleIcon sx={{ color: 'rgba(255, 255, 255, 0.7)', mr: 1, fontSize: 20 }} />
                                  <Typography variant="body2" sx={{ color: 'white' }}>
                                    {tournament.participants_count || 0} / {tournament.max_participants} participantes
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={12}>
                                <Chip 
                                  label={tournament.tournament_format === 'single_elimination' ? 'Eliminación Simple' : 
                                         tournament.tournament_format === 'double_elimination' ? 'Eliminación Doble' : 
                                         'Round Robin'}
                                  size="small"
                                  sx={{ 
                                    bgcolor: 'rgba(255, 255, 255, 0.1)', 
                                    color: 'white'
                                  }}
                                />
                              </Grid>
                            </Grid>
                          </CardContent>
                          <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {/* Navegar a detalles */}}
                              sx={{
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                color: 'white',
                                '&:hover': {
                                  borderColor: 'rgba(255, 255, 255, 0.5)',
                                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                }
                              }}
                            >
                              Ver Detalles
                            </Button>
                            <Box>
                              <IconButton 
                                size="small" 
                                onClick={() => {/* Editar torneo */}}
                                sx={{ color: 'rgba(255, 255, 255, 0.7)', mr: 1 }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                onClick={() => handleDeleteTournament(tournament.id)}
                                sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Paper className="glass-card" sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ color: 'white' }}>
                          No hay torneos programados
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 1 }}>
                          Crea un nuevo torneo para comenzar
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </>
            )}
          </>
        )}
      </Box>
      
      {/* Diálogo para crear evento/torneo */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px'
          }
        }}
      >
        <DialogTitle>
          {dialogType === 'tournament' ? 'Crear Nuevo Torneo' : 'Crear Nuevo Evento'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                <DateTimePicker
                  label="Fecha de inicio"
                  value={formData.start_date}
                  onChange={(date) => handleDateChange('start_date', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                <DateTimePicker
                  label="Fecha de fin"
                  value={formData.end_date}
                  onChange={(date) => handleDateChange('end_date', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ubicación"
                name="location"
                value={formData.location}
                onChange={handleFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Máximo de participantes"
                name="max_participants"
                type="number"
                value={formData.max_participants}
                onChange={handleFormChange}
                InputProps={{ inputProps: { min: 4, max: 128 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleFormChange}
                >
                  <MenuItem value="social">Social</MenuItem>
                  <MenuItem value="competitive">Competitivo</MenuItem>
                  {dialogType === 'tournament' && (
                    <MenuItem value="tournament">Torneo</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            {dialogType === 'tournament' && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Formato del Torneo</InputLabel>
                  <Select
                    name="tournament_format"
                    value={formData.tournament_format}
                    onChange={handleFormChange}
                  >
                    <MenuItem value="single_elimination">Eliminación Simple</MenuItem>
                    <MenuItem value="double_elimination">Eliminación Doble</MenuItem>
                    <MenuItem value="round_robin">Round Robin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Events;
