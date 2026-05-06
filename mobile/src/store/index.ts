import { configureStore } from '@reduxjs/toolkit';
import vocabularyReducer from './slices/vocabularySlice';
import authReducer from './slices/authSlice';
import topicReducer from './slices/topicSlice';

export const store = configureStore({
  reducer: {
    vocabulary: vocabularyReducer,
    auth: authReducer,
    topics: topicReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
