import { Request, Response } from "express";

export const dealGame = async (req: Request, res: Response) => {
  const { id } = req.query;
  const { services } = req.context;

  try {
    // Create a hand
    // Setup a subscriptio
    res.status(202).json("test");
  } catch (err) {
    res.status(404).json({ error: "Table not found" });
  }
};
