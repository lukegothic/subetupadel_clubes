import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  players: [],
  player: null,
  loading: false,
  error: null,
  totalPages: 0,
  currentPage: 1
};

const playerSlice = createSlice({
  name: 'players',
  initialState,
  reducers: {
    fetchPlayersStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPlayersSuccess: (state, action) => {
      state.players = action.payload.players;
      state.totalPages = action.payload.totalPages;
      state.currentPage = action.payload.currentPage;
      state.loading = false;
    },
    fetchPlayersFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchPlayerStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPlayerSuccess: (state, action) => {
      state.player = action.payload;
      state.loading = false;
    },
    fetchPlayerFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

export const {
  fetchPlayersStart,
  fetchPlayersSuccess,
  fetchPlayersFailure,
  fetchPlayerStart,
  fetchPlayerSuccess,
  fetchPlayerFailure
} = playerSlice.actions;

export default playerSlice.reducer;
