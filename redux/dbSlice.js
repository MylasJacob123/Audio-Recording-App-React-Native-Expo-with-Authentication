import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    recordings: [],
    loading: false,
    error: null
  };

const dbSlice = createSlice({
  name: "db",
  initialState,
  reducers: {
    setRecordings: (state, action) => {
      state.recordings = action.payload;
    },
    addRecording: (state, action) => {
      state.recordings.push(action.payload);
    },
    deleteRecording: (state, action) => {
      state.recordings = state.recordings.filter(
        (record) => record.uri !== action.payload
      );
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setRecordingData: (state, action) => {
      const index = state.recordings.findIndex(
        (record) => record.uri === action.payload.uri
      );
      if (index !== -1) {
        state.recordings[index] = { ...state.recordings[index], ...action.payload };
      }
    },
  },
});

export const {
  setRecordings,
  addRecording,
  deleteRecording,
  setLoading,
  setError,
  clearError,
  setRecordingData,
} = dbSlice.actions;

export default dbSlice.reducer;
