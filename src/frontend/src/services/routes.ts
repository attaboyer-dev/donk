import { apiClient } from './apiClient';

interface Table {
  id: number;
  name: string;
  sbSize: number;
  bbSize: number;
  minBuyIn: number;
  maxBuyIn: number;
  gameType: string;
}

interface HealthResponse {
  status: string;
}

export const routes = {
  health: () => apiClient.get<HealthResponse>('/health'),
  
  tables: {
    getById: (id: number) => apiClient.get<Table>(`/tables/${id}`),
  },
} as const;