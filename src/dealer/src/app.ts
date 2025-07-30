import express from "express";
import { createClient, RedisClientType } from "redis";

import apiRoutes from "./api/routes";
import { createContextMiddleware } from "./api/middleware/ContextMiddleware";

const createAppContext = async () => {
  try {
    const store = createClient() as RedisClientType;
    const sub = createClient() as RedisClientType;
    const pub = createClient() as RedisClientType;
    await Promise.all([store.connect(), sub.connect(), pub.connect()]);
    return {
      services: null,
      //services: initServices(store, pub, sub),
    };
  } catch (err) {
    console.log("Error while trying to connect to redis");
    throw new Error("Unable to initialize application context");
  }
};

(async () => {
  console.log("Initializing dealer server");
  // Create the application context - a singleton available across APIs
  const appCtx = await createAppContext();

  // Create the express application instance
  const app = express();

  app.use(express.json());
  app.use(createContextMiddleware(appCtx));

  // Add routes
  app.use("/api", apiRoutes);

  // Start the server, listening on the specified port
  app.listen(8081, () => {
    console.log(`Dealer server is running on http://localhost:8081`);
  });
})();
