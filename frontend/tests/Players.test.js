import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Players from '../src/pages/Players';
import axios from 'axios';

// Mock axios
jest.mock('axios');

// Configurar mock store
const middlewares = [thunk];
const mockStore = configureStore(middlewares);

describe('Players Component', () => {
  let store;
  const mockPlayers = [
    { id: 'p1', name: 'Jugador 1', trueskill: 15.0, preferred_side: 'right', gender: 'male', matches_played: 10, wins: 7, losses: 3, win_ratio: 0.7 },
    { id: 'p2', name: 'Jugador 2', trueskill: 16.0, preferred_side: 'left', gender: 'male', matches_played: 8, wins: 5, losses: 3, win_ratio: 0.625 },
    { id: 'p3', name: 'Jugador 3', trueskill: 16.5, preferred_side: 'right', gender: 'female', matches_played: 12, wins: 8, losses: 4, win_ratio: 0.667 }
  ];

  beforeEach(() => {
    store = mockStore({
      players: {
        players: [],
        loading: false,
        error: null,
        totalPages: 1,
        currentPage: 1
      },
      auth: {
        user: {
          id: '1',
          username: 'testuser',
          club_id: '1'
        }
      }
    });

    axios.get.mockResolvedValueOnce({
      data: {
        players: mockPlayers,
        totalPages: 1,
        currentPage: 1
      }
    });
  });

  test('renderiza correctamente', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Players />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Gestión de Jugadores')).toBeInTheDocument();
    expect(screen.getByText('Visualiza y gestiona los jugadores de tu club')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Buscar jugadores...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
  });

  test('muestra la lista de jugadores', async () => {
    store = mockStore({
      players: {
        players: mockPlayers,
        loading: false,
        error: null,
        totalPages: 1,
        currentPage: 1
      },
      auth: {
        user: {
          id: '1',
          username: 'testuser',
          club_id: '1'
        }
      }
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Players />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Jugador 1')).toBeInTheDocument();
      expect(screen.getByText('Jugador 2')).toBeInTheDocument();
      expect(screen.getByText('Jugador 3')).toBeInTheDocument();
    });
  });

  test('muestra y oculta filtros', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Players />
        </BrowserRouter>
      </Provider>
    );

    const showFiltersButton = screen.getByText('Mostrar Filtros');
    fireEvent.click(showFiltersButton);

    expect(screen.getByLabelText('Nivel Mínimo')).toBeInTheDocument();
    expect(screen.getByLabelText('Nivel Máximo')).toBeInTheDocument();
    expect(screen.getByLabelText('Género')).toBeInTheDocument();
    expect(screen.getByLabelText('Lado Preferido')).toBeInTheDocument();
    expect(screen.getByText('Aplicar Filtros')).toBeInTheDocument();
    expect(screen.getByText('Resetear')).toBeInTheDocument();

    const hideFiltersButton = screen.getByText('Ocultar Filtros');
    fireEvent.click(hideFiltersButton);

    expect(screen.queryByLabelText('Nivel Mínimo')).not.toBeInTheDocument();
  });

  test('realiza búsqueda de jugadores', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        players: [mockPlayers[0]],
        totalPages: 1,
        currentPage: 1
      }
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Players />
        </BrowserRouter>
      </Provider>
    );

    const searchInput = screen.getByPlaceholderText('Buscar jugadores...');
    fireEvent.change(searchInput, { target: { value: 'Jugador 1' } });
    
    const searchButton = screen.getByRole('button', { name: '' }); // Botón de búsqueda sin texto
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(expect.stringMatching(/.*search=Jugador%201.*/));
    });
  });

  test('aplica filtros', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        players: [mockPlayers[0]],
        totalPages: 1,
        currentPage: 1
      }
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Players />
        </BrowserRouter>
      </Provider>
    );

    const showFiltersButton = screen.getByText('Mostrar Filtros');
    fireEvent.click(showFiltersButton);

    const minLevelInput = screen.getByLabelText('Nivel Mínimo');
    fireEvent.change(minLevelInput, { target: { value: '15' } });

    const applyFiltersButton = screen.getByText('Aplicar Filtros');
    fireEvent.click(applyFiltersButton);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(expect.stringMatching(/.*min_level=15.*/));
    });
  });
});
