import { Router } from "express";
const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.get("/deal", (_req, res) => {
  res.json({ status: "ok" });
});

export default router;
