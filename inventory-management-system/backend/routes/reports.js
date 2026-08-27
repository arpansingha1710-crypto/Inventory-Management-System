import express from "express";
import Product from "../models/Product.js";
import Sale from "../models/Sale.js";
import Purchase from "../models/Purchase.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

router.get("/", async (req, res) => {
  const days = Math.min(Math.max(Number(req.query.days) || 30, 1), 365);
  const start = new Date();
  start.setDate(start.getDate() - days);

  const [
    productCount,
    stockAgg,
    salesAgg,
    purchasesAgg,
    topSales,
    lowStock,
    recentSales
  ] = await Promise.all([
    Product.countDocuments(),
    Product.aggregate([
      { $group: { _id: null, units: { $sum: "$quantity" }, stockValue: { $sum: { $multiply: ["$quantity", "$purchasePrice"] } } } }
    ]),
    Sale.aggregate([
      { $match: { date: { $gte: start } } },
      { $group: { _id: null, revenue: { $sum: "$totalAmount" }, units: { $sum: "$quantity" }, transactions: { $sum: 1 } } }
    ]),
    Purchase.aggregate([
      { $match: { date: { $gte: start } } },
      { $group: { _id: null, cost: { $sum: "$totalAmount" }, units: { $sum: "$quantity" }, transactions: { $sum: 1 } } }
    ]),
    Sale.aggregate([
      { $match: { date: { $gte: start } } },
      { $group: { _id: "$product", sold: { $sum: "$quantity" }, revenue: { $sum: "$totalAmount" } } },
      { $sort: { sold: -1 } },
      { $limit: 10 },
      { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
      { $unwind: "$product" },
      { $project: { _id: 0, productId: "$product._id", name: "$product.name", sku: "$product.sku", stock: "$product.quantity", minimumStock: "$product.minimumStock", sold: 1, revenue: 1 } }
    ]),
    Product.find({ $expr: { $lte: ["$quantity", "$minimumStock"] } })
      .populate("supplier", "name")
      .sort({ quantity: 1 })
      .limit(20),
    Sale.find({ date: { $gte: start } }).populate("product", "name").sort({ date: -1 }).limit(10)
  ]);

  const sales = salesAgg[0] || { revenue: 0, units: 0, transactions: 0 };
  const purchases = purchasesAgg[0] || { cost: 0, units: 0, transactions: 0 };
  const stock = stockAgg[0] || { units: 0, stockValue: 0 };

  const reorderSuggestions = topSales
    .map((p) => {
      const dailyRate = p.sold / days;
      const estimatedDaysLeft = dailyRate > 0 ? p.stock / dailyRate : Infinity;
      const suggested = p.stock <= p.minimumStock || estimatedDaysLeft <= 7;

      return {
        ...p,
        dailyRate: Number(dailyRate.toFixed(2)),
        estimatedDaysLeft: Number.isFinite(estimatedDaysLeft) ? Number(estimatedDaysLeft.toFixed(1)) : null,
        reorderSuggested: suggested
      };
    })
    .filter((p) => p.reorderSuggested);

  res.json({
    periodDays: days,
    productCount,
    totalStockUnits: stock.units,
    stockValue: stock.stockValue,
    sales,
    purchases,
    topSales,
    lowStock,
    reorderSuggestions,
    recentSales
  });
});

export default router;
