import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.mjs";
import { authenticateToken } from "../middleware/auth.mjs";

const router = express.Router();

// Admin Signup

router.post("/admin-signup", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin)
      return res.status(400).json({ message: "Admin already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin (role = "admin")
    const admin = new User({
      fullName,
      email,
      password: hashedPassword,
      role: "admin",
    });
    await admin.save();

    res.status(201).json({ message: "Admin registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// User Signup
router.post("/signup", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ fullName, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {

    res.status(500).json({ message: "Internal server error" });
  }
});

// User & Admin Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("signin", req.body);

    
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user._id, role: user.role, isPaid: user.isPaid }, // ✅ Include isPaid
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, role: user.role, isPaid: user.isPaid });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
