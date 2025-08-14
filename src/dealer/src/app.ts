import { createClient, RedisClientType } from "redis";
import { DEALER_EVENT_STREAM, initServices } from "@donk/backend-core";
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

  initDealer();
})();

// The process: consume message, convert payload to data structure,
// validate action, execute action, notify completion, trigger next action.
