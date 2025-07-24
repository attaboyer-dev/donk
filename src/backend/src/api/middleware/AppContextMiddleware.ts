import { NextFunction, Request, Response } from "express";
import { AppContext } from "../../types/AppContext";

export function createContextMiddleware(context: AppContext) {
  return (req: Request, _res: Response, next: NextFunction) => {
    req.context = context;
    next();
  };
}
