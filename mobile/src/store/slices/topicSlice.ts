import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Topic {
  id: string;
  name: string;
  color?: string;
}

interface TopicState {
  items: Topic[];
  loading: boolean;
  error: string | null;
}

const initialState: TopicState = {
  items: [],
  loading: false,
  error: null,
};

const topicSlice = createSlice({
  name: 'topics',
  initialState,
  reducers: {
    setTopics: (state, action: PayloadAction<Topic[]>) => {
      state.items = action.payload;
    },
    addTopic: (state, action: PayloadAction<Topic>) => {
      state.items.push(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setTopics, addTopic, setLoading, setError } = topicSlice.actions;
export default topicSlice.reducer;
