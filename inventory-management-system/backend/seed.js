import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";

await connectDB();

const email = "admin@example.com";
const password = "admin123";

const existing = await User.findOne({ email });

if (!existing) {
  const hashed = await bcrypt.hash(password, 10);
  await User.create({
    name: "Admin",
    email,
    password: hashed,
    phone: ""
  });
  console.log("Demo admin created.");
} else {
  console.log("Demo admin already exists.");
}

console.log("Login: admin@example.com / admin123");
process.exit(0);
