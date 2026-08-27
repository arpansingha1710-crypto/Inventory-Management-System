import express from "express";
import StockHistory from "../models/StockHistory.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

router.get("/", async (req, res) => {
  const history = await StockHistory.find()
    .populate("product", "name sku")
    .sort({ createdAt: -1 })
    .limit(500);

  res.json(history);
});

export default router;
