import express from "express";
import Supplier from "../models/Supplier.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

router.get("/", async (req, res) => {
  res.json(await Supplier.find().sort({ createdAt: -1 }));
});

router.post("/", async (req, res) => {
  const supplier = await Supplier.create(req.body);
  res.status(201).json(supplier);
});

router.get("/:id", async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) return res.status(404).json({ message: "Supplier not found" });
  res.json(supplier);
});

router.put("/:id", async (req, res) => {
  const supplier = await Supplier.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!supplier) return res.status(404).json({ message: "Supplier not found" });
  res.json(supplier);
});

router.delete("/:id", async (req, res) => {
  const supplier = await Supplier.findByIdAndDelete(req.params.id);
  if (!supplier) return res.status(404).json({ message: "Supplier not found" });
  res.json({ message: "Supplier deleted" });
});

export default router;
