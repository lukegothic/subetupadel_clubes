import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import playerReducer from './slices/playerSlice';
import matchReducer from './slices/matchSlice';
import eventReducer from './slices/eventSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    players: playerReducer,
    matches: matchReducer,
    events: eventReducer
  }
});

export default store;
