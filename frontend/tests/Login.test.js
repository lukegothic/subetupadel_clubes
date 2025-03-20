import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Login from '../src/pages/Login';
import axios from 'axios';

// Mock axios
jest.mock('axios');

// Configurar mock store
const middlewares = [thunk];
const mockStore = configureStore(middlewares);

describe('Login Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      auth: {
        loading: false,
        error: null,
        isAuthenticated: false
      }
    });
  });

  test('renderiza correctamente', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Gestión de Clubes de Pádel')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre de usuario')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Iniciar Sesión' })).toBeInTheDocument();
  });

  test('maneja cambios en los campos de entrada', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );

    const usernameInput = screen.getByLabelText('Nombre de usuario');
    const passwordInput = screen.getByLabelText('Contraseña');

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(usernameInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('password123');
  });

  test('envía formulario con credenciales correctas', async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        token: 'fake-token',
        admin: {
          id: '1',
          username: 'testuser',
          club_id: '1'
        }
      }
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );

    const usernameInput = screen.getByLabelText('Nombre de usuario');
    const passwordInput = screen.getByLabelText('Contraseña');
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/auth/login', {
        username: 'testuser',
        password: 'password123'
      });
    });

    const actions = store.getActions();
    expect(actions[0].type).toBe('auth/loginStart');
  });

  test('muestra error con credenciales incorrectas', async () => {
    axios.post.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Credenciales inválidas'
        }
      }
    });

    store = mockStore({
      auth: {
        loading: false,
        error: 'Credenciales inválidas',
        isAuthenticated: false
      }
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );

    const usernameInput = screen.getByLabelText('Nombre de usuario');
    const passwordInput = screen.getByLabelText('Contraseña');
    const submitButton = screen.getByRole('button', { name: 'Iniciar Sesión' });

    fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitButton);

    expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
  });
});
