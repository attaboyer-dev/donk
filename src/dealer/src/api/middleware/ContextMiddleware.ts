import { NextFunction, Request, Response } from "express";

export function createContextMiddleware(context: any) {
  return (req: Request, _res: Response, next: NextFunction) => {
    req.context = context;
    next();
  };
}
