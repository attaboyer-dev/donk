import { RedisClientType } from "redis";
import { asTable } from "../converters/tableConverter";
import { HandRepo, TableRepo } from "@donk/database";
import { ORDERED_DECK, GameState, Player, Position, HandState } from "@donk/shared";
import { IdentifyableWebSocket } from "../types/IdentifyableWebSocket";
import { asHand } from "../converters/handConverter";

export class GameStateService {
  private redisClient: RedisClientType;
  private tableRepo: TableRepo;
  private handRepo: HandRepo;

  constructor(redis: RedisClientType) {
    this.redisClient = redis;
    this.tableRepo = new TableRepo();
    this.handRepo = new HandRepo();
  }

  async startGame(tableId: number) {
    const table = asTable(await this.tableRepo.getTableById(tableId));
    const gameState = new GameState(1, table);
    await this.setGameState(gameState);
    return gameState;
  }

  async addPlayer(gameId: number, wsc: IdentifyableWebSocket) {
    const gameState = await this.getGameState(gameId);
    let player = this.getPlayer(gameState, wsc.id);
    if (player) {
      console.warn("Player - %s - already sitting at table");
    } else {
      player = Player.fromIws(wsc);
      gameState.players.push(player);
    }
    await this.setGameState(gameState);
    return player;
  }

  async removePlayer(gameId: number, wsc: IdentifyableWebSocket) {
    const gameState = await this.getGameState(gameId);
    const { players } = gameState;
    const player = this.getPlayer(gameState, wsc.id);
    if (player) {
      gameState.players = players.filter((p) => p.id !== player.id);
    } else {
      console.warn("Player - %s - isn't at the table", wsc.id);
    }
    await this.setGameState(gameState);
    return;
  }

  async playerSits(client: IdentifyableWebSocket, seat: number) {
    const { id, gameId } = client;
    const gameState = await this.getGameState(gameId);
    const player = this.getPlayer(gameState, id);
    player.assignedSeat = seat;
    await this.setGameState(gameState);
    return;
  }

  async playerStands(client: IdentifyableWebSocket) {
    const { id, gameId } = client;
    const gameState = await this.getGameState(gameId);
    const player = this.getPlayer(gameState, id);
    player.assignedSeat = -1;
    await this.setGameState(gameState);
    return;
  }

  async playerBuysIn(client: IdentifyableWebSocket, buyIn: number) {
    const { id, gameId } = client;
    const gameState = await this.getGameState(gameId);
    const player = this.getPlayer(gameState, id);
    player.stack += buyIn;
    await this.setGameState(gameState);
    return;
  }

  async playerRenames(client: IdentifyableWebSocket, name: string) {
    const { id, gameId } = client;
    const gameState = await this.getGameState(gameId);
    const player = this.getPlayer(gameState, id);
    player.name = name;
    await this.setGameState(gameState);
    return;
  }

  async playerReady(client: IdentifyableWebSocket) {
    const { id, gameId } = client;
    const gameState = await this.getGameState(gameId);
    const player = this.getPlayer(gameState, id);
    player.isReady = true;
    await this.setGameState(gameState);
    return;
  }

  getPlayer(gameState: GameState, playerId: string) {
    const { players } = gameState;
    const idx = players.findIndex((player) => player.id === playerId);
    return players[idx];
  }

  async getGameState(gameId: number): Promise<GameState> {
    const gameState = await this.redisClient.get(`game:${gameId}`);
    if (!gameState) {
      throw new Error(`Unable to retrieve game state with id: ${gameId}`);
    }
    return GameState.fromString(gameState);
  }

  async startPlay(gameId: number): Promise<void> {
    const gameState = await this.getGameState(gameId);
    gameState.inPlay = true;
    await this.setGameState(gameState);
  }

  async canStartPlay(gameId: number) {
    const gameState = await this.getGameState(gameId);
    let canStart = false;
    const eligibleForPlay = gameState.players.filter(
      (p) => p.isReady && p.assignedSeat > 0 && p.stack > 0,
    );
    if (eligibleForPlay.length > 2) {
      canStart = true;
    }
    return canStart;
  }
  async beginHand(gameId: number) {
    const gameState = await this.getGameState(gameId);
    // TODO: uncomment this when it's time to harden
    // if (gameState.currentHand && !gameState.currentHand.isCompleted) {
    //   throw new Error("Attempting to deal hand while hand is in progress");
    // }
    const hand = asHand(await this.handRepo.beginHand(gameId));
    gameState.currentHand = HandState.fromHand(hand);
    gameState.currentHand.deck = ORDERED_DECK;
    gameState.currentHand.shuffle();
    await this.setGameState(gameState);
  }

  // TODO: For initial assignment, we want to deal out cards and use the high-card as first button
  async adjustButton(gameId: number) {
    const gameState = await this.getGameState(gameId);
    this.setPlayersInHand(gameState);
    this.isButtonAssigned(gameState)
      ? this.rotateButton(gameState)
      : this.initializeButton(gameState);
    this.assignPositions(gameState);
    console.log("Adjusted button and positions: %o", gameState);

    await this.setGameState(gameState);
  }

  private async setGameState(gameState: GameState) {
    const key = `game:${gameState.id}`;
    await this.redisClient.set(key, JSON.stringify(gameState));
    return;
  }

  private setPlayersInHand(gameState: GameState) {
    const { players } = gameState;
    players.forEach((player) => {
      if (player.isEligibleForHand()) {
        player.isInHand = true;
      }
    });
  }

  private rotateButton(gameState: GameState) {
    if (gameState.players.length < 2) return;

    const currentBtnIdx = gameState.players.findIndex((p) => p.position === Position.BTN);
    if (currentBtnIdx !== -1) {
      gameState.players[currentBtnIdx].position = Position.BTN;
    }

    let nextIdx = currentBtnIdx;
    let found = false;
    const n = gameState.players.length;
    for (let i = 1; i <= n; i++) {
      const idx = (currentBtnIdx + i) % n;
      const player = gameState.players[idx];
      if (player.isInHand) {
        nextIdx = idx;
        found = true;
        break;
      }
    }

    if (found) {
      gameState.players[nextIdx].position = Position.BTN;
    }
  }

  private initializeButton(gameState: GameState) {
    const eligiblePlayers = gameState.players.filter((player) => player.isInHand);
    if (eligiblePlayers.length < 2) return;

    const randomIdx = Math.floor(Math.random() * eligiblePlayers.length);
    const chosenPlayer = eligiblePlayers[randomIdx];
    chosenPlayer.position = Position.BTN;
  }

  private isButtonAssigned(gameState: GameState) {
    return gameState.players.some((player) => player.position === Position.BTN);
  }

  private assignPositions(gameState: GameState) {
    const playersInHand = gameState.players.filter((player) => player.isInHand);
    if (playersInHand.length < 2) return;

    // Sort players by seat number to ensure proper clockwise order
    playersInHand.sort((a, b) => a.assignedSeat - b.assignedSeat);

    // Find the button player
    const buttonIdx = playersInHand.findIndex((player) => player.position === Position.BTN);
    if (buttonIdx === -1) return; // No button assigned

    // Clear all positions except button
    playersInHand.forEach((player) => {
      if (player.position !== Position.BTN) {
        player.position = null;
      }
    });

    const numPlayers = playersInHand.length;

    // Define position order starting from button
    const positionOrder = [
      Position.BTN,
      Position.SB,
      Position.BB,
      Position.UTG,
      Position.UTG1,
      Position.UTG2,
      Position.UTG3,
      Position.UTG4,
      Position.UTG5,
    ];

    // Assign positions clockwise from button
    for (let i = 0; i < numPlayers; i++) {
      const playerIdx = (buttonIdx + i) % numPlayers;
      const player = playersInHand[playerIdx];

      if (i < positionOrder.length) {
        player.position = positionOrder[i];
      } else {
        // For tables with more than 9 players, continue with UTG variants
        player.position = Position.UTG5;
      }
    }
  }

  async postBlinds(gameId: number) {
    const gameState = await this.getGameState(gameId);
    const smallBlind = gameState.players.find((player) => player.position === Position.SB);
    // TODO: Handle for 2 players
    const bigBlind = gameState.players.find((player) => player.position === Position.BB);

    if (!smallBlind || !bigBlind) {
      throw new Error("Unable to assign blinds: No small blind or big blind found");
    }

    const pot = gameState.createMainPot();
    smallBlind.stack -= gameState.table.sbSize;
    bigBlind.stack -= gameState.table.bbSize;
    pot.amount += gameState.table.sbSize + gameState.table.bbSize;
    console.log("Posted blinds");
    await this.setGameState(gameState);
  }

  async dealCards(gameId: number) {
    const gameState = await this.getGameState(gameId);
    gameState.dealCards();
    this.setGameState(gameState);
    console.log("Dealt cards");
  }

  async fold(gameId: number, playerId: number) {
    const gameState = await this.getGameState(gameId);
    const playerActing = gameState.players.find((p) => p.id === playerId);
    if (!playerActing) throw Error("acting player could not be determined");
    playerActing.nextToAct = false;
    // get the next player?
  }
}
