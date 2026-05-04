import { apiService } from './api';

export interface Topic {
  id: string;
  name: string;
  color?: string;
}

export const topicService = {
  getAll: () => apiService.get<Topic[]>('/topics'),
  create: (name: string, color?: string) => apiService.post<Topic>('/topics', { name, color }),
  update: (id: string, name: string, color?: string) => apiService.patch<Topic>(`/topics/${id}`, { name, color }),
  delete: (id: string) => apiService.delete(`/topics/${id}`),
};
