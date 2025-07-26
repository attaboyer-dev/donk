import { Table } from "../../../shared/dist";
import { apiClient } from "./apiClient";

interface HealthResponse {
  status: string;
}

export const routes = {
  health: () => apiClient.get<HealthResponse>("/health"),

  tables: {
    getById: (id: number) => apiClient.get<Table>(`/tables/${id}`),
  },
} as const;
