// An atomic entity representing a single game action in a hand
export type HandActionEntity = {
  id: number;
  handId: number;
  actionType: string; // TODO: Convert to enum
  value: any; // Dependent on the action type
  createdAt: string;
};
