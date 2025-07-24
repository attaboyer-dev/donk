import { AppContext } from "../AppContext";

declare global {
  namespace Express {
    interface Request {
      context: AppContext;
    }
  }
}
