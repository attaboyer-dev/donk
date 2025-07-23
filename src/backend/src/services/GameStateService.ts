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
    const pIndex = gameState.players.findIndex(
      (player) => player.id === wsc.id,
    );
    if (pIndex >= 0) {
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
    const pIndex = players.findIndex((player) => player.id === wsc.id);
    if (pIndex >= 0) {
      players.splice(pIndex, 1);
      console.log("Removed player from table: %s", wsc.id);
    } else {
      console.log("WARNING: Unable to find player - %s - at the table", wsc.id);
    }
    return gameState;
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
