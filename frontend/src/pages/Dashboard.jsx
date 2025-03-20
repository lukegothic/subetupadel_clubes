import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  Avatar
} from '@mui/material';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import '../styles/glassmorphism.css';

const Dashboard = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: 'Matchmaking',
      description: 'Genera partidos equilibrados con el botón mágico',
      icon: <AutoAwesomeIcon fontSize="large" />,
      color: 'linear-gradient(135deg, rgba(106, 17, 203, 0.8), rgba(37, 117, 252, 0.8))',
      path: '/matchmaking'
    },
    {
      title: 'Creador de Partidos',
      description: 'Crea partidos arrastrando jugadores',
      icon: <SportsTennisIcon fontSize="large" />,
      color: 'linear-gradient(135deg, rgba(245, 0, 87, 0.8), rgba(255, 105, 180, 0.8))',
      path: '/match-creator'
    },
    {
      title: 'Jugadores',
      description: 'Gestiona el pool de jugadores del club',
      icon: <PeopleIcon fontSize="large" />,
      color: 'linear-gradient(135deg, rgba(0, 176, 155, 0.8), rgba(150, 201, 61, 0.8))',
      path: '/players'
    },
    {
      title: 'Eventos y Torneos',
      description: 'Organiza eventos y torneos para tu club',
      icon: <EventIcon fontSize="large" />,
      color: 'linear-gradient(135deg, rgba(255, 153, 0, 0.8), rgba(255, 94, 0, 0.8))',
      path: '/events'
    },
    {
      title: 'Estadísticas',
      description: 'Visualiza estadísticas de jugadores y partidos',
      icon: <EqualizerIcon fontSize="large" />,
      color: 'linear-gradient(135deg, rgba(41, 128, 185, 0.8), rgba(142, 68, 173, 0.8))',
      path: '/stats'
    }
  ];

  return (
    <Container className="matchmaking-container">
      <Box className="glass-container" sx={{ mb: 4, p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold', color: 'white', mb: 4 }}>
          Dashboard de Gestión de Club
        </Typography>

        <Grid container spacing={3}>
          {menuItems.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                className="glass-card" 
                sx={{ 
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    boxShadow: '0 20px 30px rgba(0, 0, 0, 0.2)'
                  }
                }}
              >
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                  <Avatar 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      mb: 2,
                      background: item.color
                    }}
                  >
                    {item.icon}
                  </Avatar>
                  <Typography variant="h6" component="h2" gutterBottom align="center" sx={{ color: 'white' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" align="center" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 3, flexGrow: 1 }}>
                    {item.description}
                  </Typography>
                  <Button 
                    variant="contained" 
                    fullWidth
                    onClick={() => navigate(item.path)}
                    sx={{
                      background: item.color,
                      '&:hover': {
                        background: item.color,
                        filter: 'brightness(1.1)'
                      }
                    }}
                  >
                    Acceder
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;
