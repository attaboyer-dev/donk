export type Player = {
  id: number;
  name: string;
  isOwner: boolean; // Whether the player owns the table
  isInHand: boolean; // Whether the player is in the hand
  isMucked: boolean; // Whether the player has mucked their cards
  isBtn: boolean; // Whether the player has the button
  assignedSeat: number; // What seat is the player sitting at the table
  position: string; // Position in table in relation to order-of-play
  stack: number; // How much money the player has assigned to them
  cards: string[]; // What cards the player has assigned to them
  nextPlayerId: number; // The next player to act
};
