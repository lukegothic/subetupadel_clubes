import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Card,
  CardContent,
  Avatar,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Tabs,
  Tab,
  Paper,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { useSelector } from 'react-redux';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EditIcon from '@mui/icons-material/Edit';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupIcon from '@mui/icons-material/Group';
import SettingsIcon from '@mui/icons-material/Settings';
import LockIcon from '@mui/icons-material/Lock';
import NotificationsIcon from '@mui/icons-material/Notifications';

const Profile = () => {
  const { token } = useSelector(state => state.auth);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    location: ''
  });

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar el perfil');
      }
      
      const data = await response.json();
      setProfile(data);
      setEditForm({
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        location: data.location || ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
  };

  const handleEditSubmit = async () => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el perfil');
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      handleEditClose();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
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

  if (!profile) {
    return (
      <Box p={3}>
        <Typography variant="h6">
          No se encontró el perfil
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Mi Perfil
      </Typography>

      <Grid container spacing={3}>
        {/* Información Personal */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
                <Avatar
                  sx={{ width: 120, height: 120, mb: 2 }}
                  src={profile.avatar}
                >
                  {profile.name.charAt(0)}
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  {profile.name}
                </Typography>
                <Chip
                  label={profile.level}
                  color="primary"
                  size="small"
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={handleEditClick}
                >
                  Editar Perfil
                </Button>
              </Box>

              <List>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Email" secondary={profile.email} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Teléfono" secondary={profile.phone || 'No especificado'} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LocationOnIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Ubicación" secondary={profile.location || 'No especificada'} />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Estadísticas y Configuración */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ mb: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange} centered>
              <Tab label="Estadísticas" />
              <Tab label="Configuración" />
            </Tabs>
          </Paper>

          {activeTab === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <SportsTennisIcon color="primary" />
                      <Typography variant="h6">
                        Partidos Jugados
                      </Typography>
                    </Box>
                    <Typography variant="h4">
                      {profile.stats?.matches_played || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <EmojiEventsIcon color="primary" />
                      <Typography variant="h6">
                        Torneos Ganados
                      </Typography>
                    </Box>
                    <Typography variant="h4">
                      {profile.stats?.tournaments_won || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <GroupIcon color="primary" />
                      <Typography variant="h6">
                        Eventos Participados
                      </Typography>
                    </Box>
                    <Typography variant="h4">
                      {profile.stats?.events_participated || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Configuración de la Cuenta
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <LockIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Cambiar Contraseña"
                      secondary="Actualizar tu contraseña"
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemIcon>
                      <NotificationsIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Notificaciones"
                      secondary="Gestionar preferencias de notificaciones"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Diálogo de Edición */}
      <Dialog open={editDialogOpen} onClose={handleEditClose}>
        <DialogTitle>Editar Perfil</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} sx={{ mt: 2 }}>
            <TextField
              name="name"
              label="Nombre"
              value={editForm.name}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="email"
              label="Email"
              value={editForm.email}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="phone"
              label="Teléfono"
              value={editForm.phone}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="location"
              label="Ubicación"
              value={editForm.location}
              onChange={handleInputChange}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancelar</Button>
          <Button onClick={handleEditSubmit} variant="contained">
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile; 