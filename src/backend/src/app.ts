import { initServices } from "./services/bundle";
import { createClient, RedisClientType } from "redis";
import { WebSocketManager } from "./ws/WebSocketManager";

const createAppContext = async () => {
  const redisClient: RedisClientType = createClient();
  const sub: RedisClientType = createClient();
  const pub: RedisClientType = createClient();
  redisClient.on("error", (err) => console.error("Redis Client Error", err));

  try {
    await Promise.all([redisClient.connect(), sub.connect(), pub.connect()]);
  } catch (err) {
    console.log("Error while trying to connect to redis");
  }

  return {
    services: initServices(redisClient, pub),
    sub,
  };
};

(async () => {
  // Create the application context - a singleton available across APIs/WS calls
  const appCtx = await createAppContext();

  // For local testing - start a game
  await appCtx.services.gameStateService.startGame(1);

  // Initialize WebSocket server with organized handlers
  const wsManager = new WebSocketManager(appCtx, 3032);

  console.log("WebSocket server started on port 3032");
})();
