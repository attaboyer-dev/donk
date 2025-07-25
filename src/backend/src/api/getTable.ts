import { Request, Response } from "express";

export const getTable = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { services } = req.context;

  try {
    const table = await services.tableService.getTableById(Number(id));
    res.status(200).json(table);
  } catch (err) {
    res.status(404).json({ error: "Table not found" });
  }
};
