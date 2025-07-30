export type HandEntity = {
  id: number;
  game_id: number;
  created_at: string;
  last_updated_at: string; // Each action taken updates the hand
  is_completed: boolean; // Should always be true, unless the hand is actively being executed
};
