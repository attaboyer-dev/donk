import { Request, Response } from "express";

export const getTable = (req: Request, res: Response): void => {
  const { id } = req.params;
  const { services } = req.context;
  console.log("services exists:", !!services);
  res.send(`Table ID passed in is: ${id}`);
};
