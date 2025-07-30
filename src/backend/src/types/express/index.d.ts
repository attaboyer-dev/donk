import { AppContext } from "@donk/backend-core";

declare global {
  namespace Express {
    interface Request {
      context: AppContext;
    }
  }
}
