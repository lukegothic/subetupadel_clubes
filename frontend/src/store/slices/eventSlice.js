import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  events: [],
  event: null,
  tournaments: [],
  tournament: null,
  loading: false,
  error: null,
  totalPages: 0,
  currentPage: 1
};

const eventSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    fetchEventsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchEventsSuccess: (state, action) => {
      state.events = action.payload.events;
      state.totalPages = action.payload.totalPages;
      state.currentPage = action.payload.currentPage;
      state.loading = false;
    },
    fetchEventsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchEventStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchEventSuccess: (state, action) => {
      state.event = action.payload;
      state.loading = false;
    },
    fetchEventFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    createEventStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createEventSuccess: (state) => {
      state.loading = false;
    },
    createEventFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateEventStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateEventSuccess: (state, action) => {
      state.event = action.payload;
      state.loading = false;
    },
    updateEventFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteEventStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteEventSuccess: (state, action) => {
      state.events = state.events.filter(event => event.id !== action.payload);
      state.loading = false;
    },
    deleteEventFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addParticipantStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    addParticipantSuccess: (state, action) => {
      if (state.event) {
        state.event = {
          ...state.event,
          participants: [...(state.event.participants || []), action.payload]
        };
      }
      state.loading = false;
    },
    addParticipantFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    generateTournamentMatchesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    generateTournamentMatchesSuccess: (state, action) => {
      if (state.tournament) {
        state.tournament = {
          ...state.tournament,
          matches: action.payload.matches
        };
      }
      state.loading = false;
    },
    generateTournamentMatchesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

export const {
  fetchEventsStart,
  fetchEventsSuccess,
  fetchEventsFailure,
  fetchEventStart,
  fetchEventSuccess,
  fetchEventFailure,
  createEventStart,
  createEventSuccess,
  createEventFailure,
  updateEventStart,
  updateEventSuccess,
  updateEventFailure,
  deleteEventStart,
  deleteEventSuccess,
  deleteEventFailure,
  addParticipantStart,
  addParticipantSuccess,
  addParticipantFailure,
  generateTournamentMatchesStart,
  generateTournamentMatchesSuccess,
  generateTournamentMatchesFailure
} = eventSlice.actions;

export default eventSlice.reducer;
