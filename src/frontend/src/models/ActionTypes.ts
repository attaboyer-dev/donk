const Sources = Object.freeze({
  CLIENT: { id: 0, name: "Client", value: "CLIENT" },
  SERVER: { id: 1, name: "Server", value: "SERVER" }
});

const Actions = Object.freeze({
  BUYIN: { id: 0, name: "Buy-In", value: "BUYIN" },
  CALL: { id: 1, name: "Call", value: "CALL" },
  CHECK: { id: 2, name: "Check", value: "CHECK" },
  FOLD: { id: 3, name: "Fold", value: "FOLD" },
  JOIN: { id: 4, name: "Join", value: "JOIN" },
  LEAVE: { id: 5, name: "Leave", value: "LEAVE" },
  RAISE: { id: 6, name: "Raise", value: "RAISE" },
  READY: { id: 7, name: "Ready", value: "READY" },
  RENAME: { id: 8, name: "Rename", value: "RENAME" },
  SIT: { id: 9, name: "Sit", value: "SIT" },
  SHOW: { id: 10, name: "Show", value: "SHOW" },
  STAND: { id: 11, name: "Stand", value: "STAND" },

  PLAYER_BUYIN: {},
  PLAYER_SAT: {},
  PLAYER_STOOD: {},
  TABLE_STATE: {},
  USER_INFO: {},
  USER_JOINED: {},
  USER_LEFT: {},
});