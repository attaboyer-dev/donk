export type TableEntity = {
  id: number;
  name: string;
  sbSize: number;
  bbSize: number;
  minBuyIn: number;
  maxBuyIn: number;
  gameType: string; // TODO: Turn into an enum
};
