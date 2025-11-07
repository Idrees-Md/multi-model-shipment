// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

import locationRouter from "./routes/location.js";
import weatherRouter from "./routes/weather.js";
import deepseekRouter from "./routes/deepseek.js"; // Ensure this file exists
import authRouter from "./routes/auth.js";
import { verifyToken, requireRole } from "./middleware/auth.js";

dotenv.config(); // ✅ Load environment variables first

const app = express();

// -------------------- Middleware --------------------
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// -------------------- Routers --------------------
app.use("/api/location", locationRouter);
app.use("/api/weather", weatherRouter);
app.use("/api/auth", authRouter);
app.use("/api/ai", deepseekRouter);

// -------------------- Admin test route --------------------
app.get("/api/admin-only", verifyToken, requireRole("admin"), (req, res) => {
  res.json({ secret: "only admin can see this" });
});

// -------------------- Dummy shipment APIs --------------------
app.get("/api/air-shipments", (req, res) => {
  res.json([
    { id: "AIR123", origin: "Dubai", destination: "Bangalore", status: "In Transit", temperature: 22.5, altitude: 32000, eta: "2025-11-06T18:30:00Z" },
    { id: "AIR124", origin: "Singapore", destination: "Delhi", status: "Delivered", temperature: 23.0, altitude: 0, eta: "2025-11-04T14:00:00Z" }
  ]);
});

app.get("/api/ship-shipments", (req, res) => {
  res.json([
    { id: "SHIP900", origin: "Chennai Port", destination: "Colombo", status: "Anchored", seaTemp: 27, waveHeight: 1.5, eta: "2025-11-07T10:00:00Z" },
    { id: "SHIP901", origin: "Mumbai", destination: "Dubai", status: "In Transit", seaTemp: 29, waveHeight: 2.1, eta: "2025-11-09T15:00:00Z" }
  ]);
});

app.get("/api/road-shipments", (req, res) => {
  res.json([
    { id: "ROAD550", origin: "Chennai", destination: "Coimbatore", status: "En Route", speed: 65, fuelLevel: 60, eta: "2025-11-05T22:00:00Z" },
    { id: "ROAD551", origin: "Bangalore", destination: "Hyderabad", status: "Stopped", speed: 0, fuelLevel: 40, eta: "2025-11-06T08:00:00Z" }
  ]);
});

app.get("/api/rail-shipments", (req, res) => {
  res.json([
    { id: "RAIL330", origin: "Delhi", destination: "Chennai", status: "In Transit", carriages: 25, avgSpeed: 70, eta: "2025-11-06T06:00:00Z" },
    { id: "RAIL331", origin: "Mumbai", destination: "Kolkata", status: "Delayed", carriages: 30, avgSpeed: 50, eta: "2025-11-07T12:00:00Z" }
  ]);
});

app.get("/api/all-shipments", (req, res) => {
  res.json({
    air: 12,
    ship: 8,
    road: 20,
    rail: 15,
    active: 30,
    delayed: 5,
    delivered: 20
  });
});

// -------------------- Server start --------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Backend server running on port ${PORT}`));
