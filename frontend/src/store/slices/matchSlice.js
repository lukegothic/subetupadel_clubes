import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  matches: [],
  match: null,
  matchRequests: [],
  matchmakingSuggestions: [],
  loading: false,
  error: null,
  totalPages: 0,
  currentPage: 1
};

const matchSlice = createSlice({
  name: 'matches',
  initialState,
  reducers: {
    fetchMatchesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchMatchesSuccess: (state, action) => {
      state.matches = action.payload.matches;
      state.totalPages = action.payload.totalPages;
      state.currentPage = action.payload.currentPage;
      state.loading = false;
    },
    fetchMatchesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchMatchStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchMatchSuccess: (state, action) => {
      state.match = action.payload;
      state.loading = false;
    },
    fetchMatchFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchMatchRequestsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchMatchRequestsSuccess: (state, action) => {
      state.matchRequests = action.payload;
      state.loading = false;
    },
    fetchMatchRequestsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    generateMatchmakingSuggestionsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    generateMatchmakingSuggestionsSuccess: (state, action) => {
      state.matchmakingSuggestions = action.payload.suggestions;
      state.loading = false;
    },
    generateMatchmakingSuggestionsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    acceptMatchmakingSuggestionStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    acceptMatchmakingSuggestionSuccess: (state, action) => {
      state.matchmakingSuggestions = state.matchmakingSuggestions.map(suggestion => 
        suggestion.id === action.payload.suggestion_id 
          ? { ...suggestion, status: 'accepted', match_id: action.payload.match_id }
          : suggestion
      );
      state.loading = false;
    },
    acceptMatchmakingSuggestionFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    rejectMatchmakingSuggestionStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    rejectMatchmakingSuggestionSuccess: (state, action) => {
      state.matchmakingSuggestions = state.matchmakingSuggestions.map(suggestion => 
        suggestion.id === action.payload.suggestion_id 
          ? { ...suggestion, status: 'rejected' }
          : suggestion
      );
      state.loading = false;
    },
    rejectMatchmakingSuggestionFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

export const {
  fetchMatchesStart,
  fetchMatchesSuccess,
  fetchMatchesFailure,
  fetchMatchStart,
  fetchMatchSuccess,
  fetchMatchFailure,
  fetchMatchRequestsStart,
  fetchMatchRequestsSuccess,
  fetchMatchRequestsFailure,
  generateMatchmakingSuggestionsStart,
  generateMatchmakingSuggestionsSuccess,
  generateMatchmakingSuggestionsFailure,
  acceptMatchmakingSuggestionStart,
  acceptMatchmakingSuggestionSuccess,
  acceptMatchmakingSuggestionFailure,
  rejectMatchmakingSuggestionStart,
  rejectMatchmakingSuggestionSuccess,
  rejectMatchmakingSuggestionFailure
} = matchSlice.actions;

export default matchSlice.reducer;
