import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Matchmaking from '../src/pages/Matchmaking';
import axios from 'axios';

// Mock axios
jest.mock('axios');

// Configurar mock store
const middlewares = [thunk];
const mockStore = configureStore(middlewares);

describe('Matchmaking Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      matches: {
        matchmakingSuggestions: [],
        loading: false,
        error: null
      },
      auth: {
        user: {
          id: '1',
          username: 'testuser',
          club_id: '1'
        }
      }
    });
  });

  test('renderiza correctamente', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Matchmaking />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Sistema de Matchmaking')).toBeInTheDocument();
    expect(screen.getByText('Genera partidos equilibrados utilizando el algoritmo TrueSkill')).toBeInTheDocument();
    expect(screen.getByText('Configuración de Matchmaking')).toBeInTheDocument();
    expect(screen.getByText('Botón Mágico')).toBeInTheDocument();
  });

  test('maneja cambios en la configuración', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Matchmaking />
        </BrowserRouter>
      </Provider>
    );

    const considerPreferredSideSwitch = screen.getByLabelText('Considerar lado preferido');
    const considerGenderSwitch = screen.getByLabelText('Considerar género');

    expect(considerPreferredSideSwitch).toBeChecked();
    expect(considerGenderSwitch).not.toBeChecked();

    fireEvent.click(considerGenderSwitch);
    expect(considerGenderSwitch).toBeChecked();
  });

  test('genera sugerencias al hacer clic en el botón mágico', async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        suggestions: [
          {
            id: '1',
            balance_score: 85,
            team1_skill: 15.5,
            team2_skill: 16.2,
            player1: { id: 'p1', name: 'Jugador 1', trueskill: 15.0 },
            player2: { id: 'p2', name: 'Jugador 2', trueskill: 16.0 },
            player3: { id: 'p3', name: 'Jugador 3', trueskill: 16.5 },
            player4: { id: 'p4', name: 'Jugador 4', trueskill: 15.9 },
            status: 'pending'
          }
        ]
      }
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Matchmaking />
        </BrowserRouter>
      </Provider>
    );

    const magicButton = screen.getByText('Botón Mágico');
    fireEvent.click(magicButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/matches/matchmaking/suggestions', {
        club_id: '1',
        min_skill_difference: 2.0,
        max_skill_difference: 5.0,
        consider_preferred_side: true,
        consider_gender: false
      });
    });
  });

  test('muestra sugerencias de partidos', () => {
    store = mockStore({
      matches: {
        matchmakingSuggestions: [
          {
            id: '1',
            balance_score: 85,
            team1_skill: 15.5,
            team2_skill: 16.2,
            player1: { id: 'p1', name: 'Jugador 1', trueskill: 15.0 },
            player2: { id: 'p2', name: 'Jugador 2', trueskill: 16.0 },
            player3: { id: 'p3', name: 'Jugador 3', trueskill: 16.5 },
            player4: { id: 'p4', name: 'Jugador 4', trueskill: 15.9 },
            status: 'pending'
          }
        ],
        loading: false,
        error: null
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
          <Matchmaking />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Sugerencias de Partidos')).toBeInTheDocument();
    expect(screen.getByText('Partido Equilibrado')).toBeInTheDocument();
    expect(screen.getByText('Equilibrio: 85%')).toBeInTheDocument();
    expect(screen.getByText('Equipo 1 - Nivel: 15.5')).toBeInTheDocument();
    expect(screen.getByText('Equipo 2 - Nivel: 16.2')).toBeInTheDocument();
    expect(screen.getAllByText('Jugador 1')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Jugador 2')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Jugador 3')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Jugador 4')[0]).toBeInTheDocument();
    expect(screen.getByText('Aceptar')).toBeInTheDocument();
    expect(screen.getByText('Rechazar')).toBeInTheDocument();
  });

  test('acepta una sugerencia de partido', async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        match_id: 'm1'
      }
    });

    store = mockStore({
      matches: {
        matchmakingSuggestions: [
          {
            id: '1',
            balance_score: 85,
            team1_skill: 15.5,
            team2_skill: 16.2,
            player1: { id: 'p1', name: 'Jugador 1', trueskill: 15.0 },
            player2: { id: 'p2', name: 'Jugador 2', trueskill: 16.0 },
            player3: { id: 'p3', name: 'Jugador 3', trueskill: 16.5 },
            player4: { id: 'p4', name: 'Jugador 4', trueskill: 15.9 },
            status: 'pending'
          }
        ],
        loading: false,
        error: null
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
          <Matchmaking />
        </BrowserRouter>
      </Provider>
    );

    const acceptButton = screen.getByText('Aceptar');
    fireEvent.click(acceptButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/matches/matchmaking/suggestions/1/accept', {
        played_on: expect.any(String)
      });
    });
  });
});
