import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface FlashcardState {
  items: any[];
  loading: boolean;
  error: string | null;
}

const initialState: FlashcardState = {
  items: [],
  loading: false,
  error: null,
};

const flashcardSlice = createSlice({
  name: 'flashcards',
  initialState,
  reducers: {
    setFlashcards: (state, action: PayloadAction<any[]>) => {
      state.items = action.payload;
    },
    addFlashcard: (state, action: PayloadAction<any>) => {
      state.items.unshift(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setFlashcards, addFlashcard, setLoading, setError } = flashcardSlice.actions;
export default flashcardSlice.reducer;
