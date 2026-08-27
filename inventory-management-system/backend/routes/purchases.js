import express from "express";
import Purchase from "../models/Purchase.js";
import Product from "../models/Product.js";
import StockHistory from "../models/StockHistory.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

// GET all purchases
router.get("/", async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate("supplier", "name")
      .populate("product", "name sku")
      .sort({ date: -1 });

    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE purchase
router.post("/", async (req, res) => {
  try {
    const {
      supplier,
      product,
      quantity,
      purchasePrice,
      date,
      note
    } = req.body;

    if (!supplier || !product || !quantity || purchasePrice === undefined) {
      return res.status(400).json({
        message: "Supplier, product, quantity and price are required"
      });
    }

    const qty = Number(quantity);
    const price = Number(purchasePrice);

    if (qty <= 0 || price < 0) {
      return res.status(400).json({
        message: "Quantity must be greater than 0 and price cannot be negative"
      });
    }

    // Find product
    const productDoc = await Product.findById(product);

    if (!productDoc) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    // Remember old stock
    const previousStock = productDoc.quantity;

    // Increase stock
    const newStock = previousStock + qty;

    productDoc.quantity = newStock;
    await productDoc.save();

    // Create purchase record
    const purchase = await Purchase.create({
      supplier,
      product,
      quantity: qty,
      purchasePrice: price,
      totalAmount: qty * price,
      date: date || Date.now(),
      note: note || "",
      createdBy: req.user._id
    });

    // Create stock history
    await StockHistory.create({
      product,
      type: "IN",
      quantity: qty,
      previousStock,
      newStock,
      referenceType: "PURCHASE",
      referenceId: purchase._id,
      note: note || "",
      createdBy: req.user._id
    });

    const populatedPurchase = await Purchase.findById(purchase._id)
      .populate("supplier", "name")
      .populate("product", "name sku");

    res.status(201).json(populatedPurchase);

  } catch (error) {
    console.error("Purchase error:", error);
    res.status(400).json({
      message: error.message
    });
  }
});

export default router;