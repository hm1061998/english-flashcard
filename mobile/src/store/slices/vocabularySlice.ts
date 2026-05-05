import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Flashcard {
  id: string;
  word: string;
  definition: string;
  example?: string;
  synced?: boolean;
}

interface VocabularyState {
  cards: Flashcard[];
  isOffline: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: VocabularyState = {
  cards: [],
  isOffline: false,
  loading: false,
  error: null,
};

const vocabularySlice = createSlice({
  name: 'vocabulary',
  initialState,
  reducers: {
    setCards: (state, action: PayloadAction<Flashcard[]>) => {
      state.cards = action.payload;
    },
    addCard: (state, action: PayloadAction<Flashcard>) => {
      state.cards.push(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    toggleOffline: (state, action: PayloadAction<boolean>) => {
      state.isOffline = action.payload;
    },
  },
});

export const { setCards, addCard, setLoading, setError, toggleOffline } = vocabularySlice.actions;
export default vocabularySlice.reducer;
