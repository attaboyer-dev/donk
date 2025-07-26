export type Player = {
    id: number;
    name: string;
    isOwner: boolean;
    isInHand: boolean;
    isMucked: boolean;
    isBtn: boolean;
    assignedSeat: number;
    position: string;
    stack: number;
    cards: string[];
    nextPlayerId: number;
};
