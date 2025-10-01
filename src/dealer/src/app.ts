import { createClient, RedisClientType } from "redis";
import { delay, DEALER_EVENT_STREAM, initServices } from "@donk/backend-core";
import { HandActionProcessor } from "./handlers/HandEventProcessor";
import { GameEvent } from "@donk/shared";
const EVENT_CONSUMER_GROUP_NAME = "dealers";

const createAppContext = async () => {
  try {
    const store = createClient() as RedisClientType;
    const sub = createClient() as RedisClientType;
    const pub = createClient() as RedisClientType;
    await Promise.all([store.connect(), sub.connect(), pub.connect()]);
    return {
      services: initServices(store, pub, sub),
      store,
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
  const processor = new HandActionProcessor(appCtx);

  const consumeHandEvents = async (redis: RedisClientType, dealerName: string) => {
    try {
      const response = await redis.xReadGroup(
        EVENT_CONSUMER_GROUP_NAME,
        dealerName,
        [{ key: DEALER_EVENT_STREAM, id: ">" }],
        { BLOCK: 15000, COUNT: 1 },
      );

      if (response && response[0]) {
        for (const stream of response) {
          const [name, messages] = [stream.name, stream.messages];
          for (const message of messages) {
            console.log(`Consumer ${dealerName} got message:`, message);

            // Process the event with HandEventProcessor
            const { action, payload } = message.message;
            if (action) {
              console.log("beginning process of action");
              await processor.processAction(action as GameEvent, JSON.parse(payload));
            } else {
              console.error("No action received; skipping");
            }
            console.log("complete process of action");

            await redis.xAck(name, EVENT_CONSUMER_GROUP_NAME, message.id);
            console.log("message acknowledged");
          }
        }
      }
    } catch (error) {
      console.error(`Error consuming hand events for ${dealerName}:`, error);
      throw error;
    }
  };

  const initDealer = async () => {
    await appCtx.services.dealerService.createDealerGroup();
    const dealerName = `dealer-${Math.floor(Math.random() * 1000)}`;
    while (true) {
      await consumeHandEvents(appCtx.store, dealerName);
    }
  };

  async function handleTimeout(event: any) {
    console.log(`[TIMEOUT] Processing timeout at ${new Date().toISOString()}`);
    await processor.processAction(GameEvent.Fold, JSON.parse(event));
  }

  const pollLoop = async () => {
    const redis = appCtx.store;
    while (true) {
      try {
        // Atomically pop the earliest timeout
        const result = await redis.zPopMin("timeouts");

        // Nothing due yet
        if (!result) {
          await delay(100);
          continue;
        }

        const { value: itemId, score } = result;
        const dueAt = score;
        const now = Date.now();

        if (dueAt > now) {
          // Not due yet → put it back and wait
          await redis.zAdd("timeouts", [{ score: dueAt, value: itemId }]);
          await delay(Math.min(dueAt - now, 100));
          continue;
        }

        // Process the timeout
        await handleTimeout(itemId);
      } catch (err) {
        console.error("[ERROR] in poll loop:", err);
        // brief backoff to avoid tight error loops
        await delay(500);
      }
    }
  };

  try {
    initDealer();
    pollLoop();
  } catch (error) {
    console.error("Error initializing dealer:", error);
  }
})();

// The process: consume message, convert payload to data structure,
// validate action, execute action, notify completion, trigger next action.
