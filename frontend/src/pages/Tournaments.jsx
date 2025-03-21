import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  TextField,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { useSelector } from 'react-redux';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const Tournaments = () => {
  const navigate = useNavigate();
  const { token } = useSelector(state => state.auth);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTournament, setSelectedTournament] = useState(null);

  useEffect(() => {
    fetchTournaments();
  }, [token]);

  const fetchTournaments = async () => {
    try {
      const response = await fetch('/api/tournaments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar los torneos');
      }
      
      const data = await response.json();
      setTournaments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleFilterStatusChange = (event) => {
    setFilterStatus(event.target.value);
    setPage(0);
  };

  const handleFilterTypeChange = (event) => {
    setFilterType(event.target.value);
    setPage(0);
  };

  const handleMenuClick = (event, tournament) => {
    setAnchorEl(event.currentTarget);
    setSelectedTournament(tournament);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTournament(null);
  };

  const handleViewDetails = () => {
    if (selectedTournament) {
      navigate(`/tournaments/${selectedTournament.id}`);
    }
    handleMenuClose();
  };

  const handleCreateTournament = () => {
    navigate('/tournaments/create');
  };

  const filteredTournaments = tournaments.filter(tournament => {
    const matchesSearch = tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tournament.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || tournament.status === filterStatus;
    const matchesType = filterType === 'all' || tournament.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'completed':
        return 'default';
      case 'upcoming':
        return 'primary';
      default:
        return 'default';
    }
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

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Torneos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateTournament}
        >
          Nuevo Torneo
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Box p={2} display="flex" gap={2} alignItems="center">
          <TextField
            placeholder="Buscar torneos..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              value={filterStatus}
              label="Estado"
              onChange={handleFilterStatusChange}
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="active">Activos</MenuItem>
              <MenuItem value="completed">Completados</MenuItem>
              <MenuItem value="upcoming">Próximos</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={filterType}
              label="Tipo"
              onChange={handleFilterTypeChange}
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="singles">Singles</MenuItem>
              <MenuItem value="doubles">Doubles</MenuItem>
              <MenuItem value="mixed">Mixtos</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Ubicación</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Participantes</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTournaments
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((tournament) => (
                <TableRow key={tournament.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <EmojiEventsIcon color="primary" />
                      {tournament.name}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {new Date(tournament.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{tournament.location}</TableCell>
                  <TableCell>{tournament.type}</TableCell>
                  <TableCell>
                    <Chip
                      label={tournament.status}
                      color={getStatusColor(tournament.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {tournament.participants_count || 0} / {tournament.max_participants}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Más opciones">
                      <IconButton
                        onClick={(e) => handleMenuClick(e, tournament)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredTournaments.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página:"
        rowsPerPageOptions={[5, 10, 25, 50]}
      />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewDetails}>
          Ver detalles
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          Editar
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          Eliminar
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Tournaments; 