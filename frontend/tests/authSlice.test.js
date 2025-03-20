import { authReducer, loginStart, loginSuccess, loginFailure, logout, updateProfile } from '../src/store/slices/authSlice';

describe('Auth Slice', () => {
  const initialState = {
    isAuthenticated: false,
    token: null,
    user: null,
    loading: false,
    error: null
  };

  test('debe manejar loginStart correctamente', () => {
    const nextState = authReducer(initialState, loginStart());
    expect(nextState.loading).toBe(true);
    expect(nextState.error).toBe(null);
  });

  test('debe manejar loginSuccess correctamente', () => {
    const payload = {
      token: 'fake-token',
      admin: {
        id: '1',
        username: 'testuser',
        club_id: '1'
      }
    };
    
    const nextState = authReducer(initialState, loginSuccess(payload));
    
    expect(nextState.isAuthenticated).toBe(true);
    expect(nextState.token).toBe('fake-token');
    expect(nextState.user).toEqual(payload.admin);
    expect(nextState.loading).toBe(false);
    expect(nextState.error).toBe(null);
  });

  test('debe manejar loginFailure correctamente', () => {
    const error = 'Credenciales inválidas';
    const nextState = authReducer(initialState, loginFailure(error));
    
    expect(nextState.isAuthenticated).toBe(false);
    expect(nextState.token).toBe(null);
    expect(nextState.user).toBe(null);
    expect(nextState.loading).toBe(false);
    expect(nextState.error).toBe(error);
  });

  test('debe manejar logout correctamente', () => {
    const loggedInState = {
      isAuthenticated: true,
      token: 'fake-token',
      user: { id: '1', username: 'testuser' },
      loading: false,
      error: null
    };
    
    const nextState = authReducer(loggedInState, logout());
    
    expect(nextState.isAuthenticated).toBe(false);
    expect(nextState.token).toBe(null);
    expect(nextState.user).toBe(null);
  });

  test('debe manejar updateProfile correctamente', () => {
    const loggedInState = {
      isAuthenticated: true,
      token: 'fake-token',
      user: { id: '1', username: 'testuser', email: 'test@example.com' },
      loading: false,
      error: null
    };
    
    const updatedProfile = {
      email: 'updated@example.com',
      first_name: 'Test',
      last_name: 'User'
    };
    
    const nextState = authReducer(loggedInState, updateProfile(updatedProfile));
    
    expect(nextState.user).toEqual({
      id: '1',
      username: 'testuser',
      email: 'updated@example.com',
      first_name: 'Test',
      last_name: 'User'
    });
  });
});
