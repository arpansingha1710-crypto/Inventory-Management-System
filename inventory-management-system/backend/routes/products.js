import express from "express";
import Product from "../models/Product.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

router.get("/", async (req, res) => {
  const products = await Product.find().populate("supplier", "name").sort({ createdAt: -1 });
  res.json(products);
});

router.post("/", async (req, res) => {
  const product = await Product.create(req.body);
  const populated = await Product.findById(product._id).populate("supplier", "name");
  res.status(201).json(populated);
});

router.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id).populate("supplier", "name");
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
});

router.put("/:id", async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate("supplier", "name");

  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
});

router.delete("/:id", async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json({ message: "Product deleted" });
});

export default router;
