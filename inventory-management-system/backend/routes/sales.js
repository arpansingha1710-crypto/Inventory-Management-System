import express from "express";
import Sale from "../models/Sale.js";
import Product from "../models/Product.js";
import StockHistory from "../models/StockHistory.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

// GET all sales
router.get("/", async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate("product", "name sku")
      .sort({ date: -1 });

    res.json(sales);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// CREATE sale
router.post("/", async (req, res) => {
  try {
    const {
      product,
      quantity,
      sellingPrice,
      customerName,
      date,
      note
    } = req.body;

    if (!product || !quantity || sellingPrice === undefined) {
      return res.status(400).json({
        message: "Product, quantity and selling price are required"
      });
    }

    const qty = Number(quantity);
    const price = Number(sellingPrice);

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

    // Check stock
    if (productDoc.quantity < qty) {
      return res.status(400).json({
        message: `Insufficient stock. Available: ${productDoc.quantity}`
      });
    }

    // Remember old stock
    const previousStock = productDoc.quantity;

    // Decrease stock
    const newStock = previousStock - qty;

    productDoc.quantity = newStock;
    await productDoc.save();

    // Create sale record
    const sale = await Sale.create({
      product,
      quantity: qty,
      sellingPrice: price,
      totalAmount: qty * price,
      customerName: customerName || "",
      date: date || Date.now(),
      note: note || "",
      createdBy: req.user._id
    });

    // Create stock history
    await StockHistory.create({
      product,
      type: "OUT",
      quantity: qty,
      previousStock,
      newStock,
      referenceType: "SALE",
      referenceId: sale._id,
      note: note || "",
      createdBy: req.user._id
    });

    const populatedSale = await Sale.findById(sale._id)
      .populate("product", "name sku");

    res.status(201).json(populatedSale);

  } catch (error) {
    console.error("Sale error:", error);

    res.status(400).json({
      message: error.message
    });
  }
});

export default router;