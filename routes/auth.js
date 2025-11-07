// backend/routes/auth.js
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// Demo in-memory users (replace with DB in production)
const users = [
  { id: 1, username: "admin", passwordHash: bcrypt.hashSync("adminpass", 8), role: "admin" },
  { id: 2, username: "user",  passwordHash: bcrypt.hashSync("userpass", 8),  role: "user" }
];

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const valid = bcrypt.compareSync(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  const payload = { id: user.id, username: user.username, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET || "dev_secret", { expiresIn: "8h" });

  res.json({ token, role: user.role, username: user.username });
});

export default router;
