import apiClient from './client';

export interface Topic {
  id: string;
  name: string;
  color?: string;
}

export const topicService = {
  getAll: async (): Promise<Topic[]> => {
    return apiClient.get('/topics');
  },
  create: async (name: string, color?: string): Promise<Topic> => {
    return apiClient.post('/topics', { name, color });
  },
  update: async (id: string, name: string, color?: string): Promise<Topic> => {
    return apiClient.patch(`/topics/${id}`, { name, color });
  },
  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/topics/${id}`);
  },
};
