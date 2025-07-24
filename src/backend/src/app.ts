import http from "http";
import express from "express";
import { createClient, RedisClientType } from "redis";

import apiRoutes from "./api/routes";
import { initServices } from "./services/bundle";
import { WebSocketManager } from "./ws/WebSocketManager";
import { createContextMiddleware } from "./api/middleware/AppContextMiddleware";

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
  console.log("Initializing backend server");
  // Create the application context - a singleton available across APIs/WS calls
  const appCtx = await createAppContext();

  // Create the express application instance
  const app = express();

  // Add middleware
  app.use(express.json());
  app.use(createContextMiddleware(appCtx));

  // Add routes
  app.use("/api", apiRoutes);

  // Create a HTTP and WS servers
  const server = http.createServer(app);
  const wsManager = new WebSocketManager(appCtx, server);

  // For local testing - start a game
  await appCtx.services.gameStateService.startGame(1);

  // Start the server, listening on the specified port
  server.listen(8080, () => {
    console.log(`Server is running on http://localhost:8080`);
  });
})();
