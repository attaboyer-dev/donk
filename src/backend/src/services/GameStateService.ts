import { RedisClientType } from "redis";
import { asTable, TableRepo } from "@donk/database";
import GameState from "../models/GameState";
import { IdentifyableWebSocket } from "../ws/IdentifyableWebSocket";
import Player from "../models/Player";

export class GameStateService {
  private redisClient: RedisClientType;
  private tableRepo: TableRepo;

  constructor(redis: RedisClientType) {
    this.redisClient = redis;
    this.tableRepo = new TableRepo();
  }

  async startGame(tableId: number) {
    const table = asTable(await this.tableRepo.getTableById(tableId));
    const gameState = new GameState(1, table);
    await this.setGameState(gameState);
    return gameState;
  }

  async addPlayer(gameId: number, wsc: IdentifyableWebSocket) {
    const gameState = await this.getGameState(gameId);
    console.log("game state before adding player: %o", gameState);
    let toReturn;
    const player = this.getPlayer(gameState, wsc.id);
    if (player) {
      console.log("WARNING: Player - %s - already sitting at table");
    } else if (gameState.players.length >= 9) {
      console.log("WARNING: Table is already at max capacity");
    } else {
      toReturn = new Player(wsc);
      gameState.players.push(toReturn);
      console.log("Adding new player to table: %s", wsc.id);
    }
    await this.setGameState(gameState);
    console.log("game state after adding player: %o", gameState);

    return toReturn;
  }

  async removePlayer(gameId: number, wsc: IdentifyableWebSocket) {
    const gameState = await this.getGameState(gameId);
    const { players } = gameState;
    const player = this.getPlayer(gameState, wsc.id);
    if (player) {
      gameState.players = players.filter((p) => p.id === player.id);
      console.log("Removed player from table: %s", wsc.id);
    } else {
      console.log("WARNING: Unable to find player - %s - at the table", wsc.id);
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

  private async setGameState(gameState: GameState) {
    const key = `game:${gameState.id}`;
    await this.redisClient.set(key, JSON.stringify(gameState));
    return;
  }
}
