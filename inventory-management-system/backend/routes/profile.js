import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

router.get("/", async (req, res) => {
  res.json(req.user);
});

router.put("/", async (req, res) => {
  const { name, phone, password } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) return res.status(404).json({ message: "User not found" });

  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (password) user.password = await bcrypt.hash(password, 10);

  await user.save();

  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone
  });
});

export default router;
