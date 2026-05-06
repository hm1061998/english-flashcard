import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Flashcard {
  id: string;
  word: string;
  definition: string;
  example?: string;
  topicId?: string;
  synced?: boolean;
}

interface VocabularyState {
  cards: Flashcard[];
  selectedTopicId: string | null;
  isOffline: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: VocabularyState = {
  cards: [],
  selectedTopicId: null,
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
    setSelectedTopicId: (state, action: PayloadAction<string | null>) => {
      state.selectedTopicId = action.payload;
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

export const { 
  setCards, 
  setSelectedTopicId, 
  addCard, 
  setLoading, 
  setError, 
  toggleOffline 
} = vocabularySlice.actions;

export default vocabularySlice.reducer;
