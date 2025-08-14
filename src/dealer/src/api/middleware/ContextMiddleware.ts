import { NextFunction, Request, Response } from "express";
import { AppContext } from "@donk/backend-core";

export function createContextMiddleware(context: AppContext) {
  return (req: Request, _res: Response, next: NextFunction) => {
    req.context = context;
    next();
  };
}
