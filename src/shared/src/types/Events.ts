type BaseDealerEvent = {
  gameId: string;
};

export type StartPlayEvent = BaseDealerEvent;

export type FoldEvent = BaseDealerEvent & {
  playerId: string;
};
