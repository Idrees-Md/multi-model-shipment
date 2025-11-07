// backend/routes/location.js
import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

/**
 * GET /api/location/:shipmentId
 * Returns current lat/lon + city for a shipment
 */
router.get("/:shipmentId", async (req, res) => {
  const { shipmentId } = req.params;

  try {
    // Simulate random movement near Chennai (replace with real GPS API later)
    const lat = 12.9 + Math.random() * 0.5; // ~12.9–13.4
    const lon = 80.0 + Math.random() * 0.5; // ~80.0–80.5

    let currentCity = "Unknown";

    try {
      const geoRes = await axios.get("https://api.opencagedata.com/geocode/v1/json", {
        params: {
          q: `${lat}+${lon}`,
          key: process.env.OPENCAGE_API_KEY,
          limit: 1,
        },
      });

      const comp = geoRes.data?.results?.[0]?.components || {};
      currentCity =
        comp.city ||
        comp.town ||
        comp.village ||
        comp.suburb ||
        comp.state ||
        "Unknown";
    } catch (geoErr) {
      console.warn("OpenCage lookup failed, using fallback:", geoErr.message);
    }

    res.json({
      shipmentId,
      lat,
      lon,
      currentCity,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Location route error:", err.message);
    res.status(500).json({ error: "Failed to get current location" });
  }
});

export default router;
