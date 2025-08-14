import { RedisClientType } from "redis";
import { asTable } from "../converters/tableConverter";
import { HandRepo, TableRepo } from "@donk/database";
import { GameEvent, GameState, HandState, Player } from "@donk/shared";
import { IdentifyableWebSocket } from "../types/IdentifyableWebSocket";
import { DEALER_EVENT_STREAM } from "../utils/consts";

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
      player = new Player(wsc);
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
    const gameStateJson = await this.redisClient.get(`game:${gameId}`);
    if (!gameStateJson) {
      throw new Error(`Unable to retrieve game state with id: ${gameId}`);
    }
    return JSON.parse(gameStateJson) as GameState;
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
    if (gameState.currentHand && !gameState.currentHand.isCompleted) {
      throw new Error("Attempting to deal hand while hand is in progress");
    }
    const handEntity = await this.handRepo.beginHand(gameId);
    const handState = new HandState(handEntity);
    gameState.currentHand = handState;
    await this.setGameState(gameState);
  }

  // TODO: For initial assignment, we want to deal out cards and use the high-card as first button
  async adjustButton(gameId: number) {
    const gameState = await this.getGameState(gameId);
    gameState.isButtonAssigned() ? gameState.rotateButton() : gameState.initializeButton();
    await this.setGameState(gameState);
  }

  private async setGameState(gameState: GameState) {
    const key = `game:${gameState.id}`;
    await this.redisClient.set(key, JSON.stringify(gameState));
    return;
  }
}
