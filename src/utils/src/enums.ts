export enum UserEvent {
  FOLD = "FOLD",
  CHECK = "CHECK",
  CALL = "CALL",
  RAISE = "RAISE",
  SHOW = "SHOW",
  SIT = "SIT",
  STAND = "STAND",
  BUYIN = "BUYIN",
  LEAVE = "LEAVE",
  JOIN = "JOIN",
}

export enum GameEvent {
  ASSIGN_BUTTON = "ASSIGN_BUTTON",
  MOVE_BUTTON = "MOVE_BUTTON",
  PAY_BLIND = "PAY_BLIND",
  ASSIGN_BLINDS = "ASSIGN_BLINDS",
  START_HAND = "START_HAND",
  END_HAND = "END_HAND",
  START_ROUND = "START_ROUND",
  END_ROUND = "END_ROUND",
  START_TURN = "START_TURN",
  END_TURN = "END_TURN",
}

export enum Position {
  UTG = "UTG+0",
  UTG1 = "UTG+1",
  UTG2 = "UTG+2",
  UTG3 = "UTG+3",
  UTG4 = "UTG+4",
  UTG5 = "UTG+5",
  UTG6 = "UTG+6",
  UTG7 = "UTG+7",
  UTG8 = "UTG+8",
  UTG9 = "UTG+9",
}

export enum Hand {
  HIGH_CARD = "HIGH_CARD",
  PAIR = "PAIR",
  TWO_PAIR = "TWO_PAIR",
  THREE_OF_A_KIND = "THREE_OF_A_KIND",
  STRAIGHT = "STRAIGHT",
  FLUSH = "FLUSH",
  FULL_HOUSE = "FULL_HOUSE",
  STRAIGHT_FLUSH = "STRAIGHT_FLUSH",
  ROYAL_FLUSH = "ROYAL_FLUSH",
}

export enum GameType {
  NLHE = "NLHE",
}
