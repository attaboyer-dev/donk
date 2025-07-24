import { initServices } from "./services/bundle";
import { createClient, RedisClientType } from "redis";
import { WebSocketManager } from "./ws/WebSocketManager";

const createAppContext = async () => {
  try {
    const store = createClient() as RedisClientType;
    const sub = createClient() as RedisClientType;
    const pub = createClient() as RedisClientType;
    await Promise.all([store.connect(), sub.connect(), pub.connect()]);
    return {
      services: initServices(store, pub, sub),
    };
  } catch (err) {
    console.log("Error while trying to connect to redis");
    throw new Error("Unable to initialize application context");
  }
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
