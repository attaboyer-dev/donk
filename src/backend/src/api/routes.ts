import { Router } from "express";
import { getTable } from "./getTable";
const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.get("/tables/:id", getTable);

export default router;
