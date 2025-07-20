export type HandEntity = {
  id: number;
  gameId: number;
  createdAt: string;
  lastUpdatedAt: string; // Each action taken updates the hand
  isCompleted: boolean; // Should always be true, unless the hand is actively being executed
};
