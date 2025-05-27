import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SelectedNoteState {
  selectedNoteId: string | null;
}

const initialState: SelectedNoteState = {
  selectedNoteId: null,
};

const selectedNoteSlice = createSlice({
  name: "selectedNote",
  initialState,
  reducers: {
    selectNote: (state, action: PayloadAction<string | null>) => {
      state.selectedNoteId = action.payload;
    },
    clearSelectedNote: (state) => {
      state.selectedNoteId = null;
    },
  },
});

export const { selectNote, clearSelectedNote } = selectedNoteSlice.actions;

export default selectedNoteSlice.reducer;