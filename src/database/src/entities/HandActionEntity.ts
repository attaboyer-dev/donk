// An atomic entity representing a single game action in a hand
export type HandActionEntity = {
  id: number;
  hand_id: number;
  action_type: string;
  value: any; // Dependent on the action type
  created_at: string;
};
