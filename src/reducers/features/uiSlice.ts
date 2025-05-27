// src/features/ui/uiSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  isSidebarOpen: boolean;
  isNoteListOpen: boolean;
}

const initialState: UIState = {
  isSidebarOpen: false,
  isNoteListOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    toggleNoteList(state) {
      state.isNoteListOpen = !state.isNoteListOpen;
    },
  },
});

export const { toggleSidebar, toggleNoteList } = uiSlice.actions;
export default uiSlice.reducer;
