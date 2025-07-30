export enum UserEvent {
  Fold = "Fold",
  Check = "Check",
  Call = "Call",
  Raise = "Raise",
  Show = "Show",
  Sit = "Sit",
  Stand = "Stand",
  BuyIn = "BuyIn",
  Leave = "Leave",
  Join = "Join",
  Ready = "Ready",
  Rename = "Rename",
}

export enum ServerEvent {
  UserInfo = "UserInfo",
  GameState = "GameState",
  PlayerSat = "PlayerSat",
  PlayerStood = "PlayerStood",
  Rename = "Rename",
  UserJoined = "UserJoined", // Rename to PlayerJoined
  UserLeft = "UserLeft", // Rename to PlayerLeft
  PlayerBuyin = "PlayerBuyin",
  Ready = "Ready",
  HandStarted = "HandStarted",
}

export enum GameEvent {
  AssignButton = "AssignButton",
  MoveButton = "MoveButton",
  PayBlind = "PayBlind",
  AssignBlinds = "AssignBlinds",
  StartHand = "StartHand",
  EndHand = "EndHand",
  StartRound = "StartRound",
  EndRound = "EndRound",
  StartTurn = "StartTurn",
  EndTurn = "EndTurn",
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
  HighCard = "High Card",
  Pair = "Pair",
  TwoPair = "Two Pair",
  ThreeOfAKind = "Three of a Kind",
  Straight = "Straight",
  Flush = "Flush",
  FullHouse = "Full House",
  StraightFlush = "Straight Flush",
  RoyalFlush = "Royal Flush",
}

export enum GameType {
  NLHE = "NLHE",
}

export enum HandType {
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
