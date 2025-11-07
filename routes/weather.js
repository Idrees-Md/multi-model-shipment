// backend/routes/weather.js
import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

/**
 * GET /api/weather?lat=..&lon=..
 * Returns current weather for coordinates
 */
router.get("/", async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: "lat and lon are required" });
  }

  try {
    const wxRes = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
      params: {
        lat,
        lon,
        appid: process.env.OPENWEATHER_API_KEY,
        units: "metric",
      },
    });

    res.json(wxRes.data);
  } catch (err) {
    console.error("Weather route error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch weather" });
  }
});

export default router;
