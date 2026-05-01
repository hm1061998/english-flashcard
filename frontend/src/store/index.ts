import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import flashcardReducer from '@/features/flashcards/flashcardSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    flashcards: flashcardReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
