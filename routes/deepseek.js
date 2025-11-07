import express from "express";
const router = express.Router();

// Helper to randomize score slightly
const randomizeScore = (score, variance = 5) => {
  const change = Math.floor(Math.random() * (variance * 2 + 1)) - variance;
  let newScore = score + change;
  if (newScore > 100) newScore = 100;
  if (newScore < 0) newScore = 0;
  return newScore;
};

// Helper to calculate urgency penalty based on ETA (in hours)
const calculateUrgencyPenalty = (etaHours) => {
  if (etaHours <= 2) return 15;
  if (etaHours <= 6) return 10;
  if (etaHours <= 12) return 5;
  return 0;
};

// POST /api/ai/analyze
router.post("/analyze", (req, res) => {
  try {
    const { cargoType, route, additionalData, vehicleType, etaHours } = req.body;

    if (!cargoType || !route) {
      return res.status(400).json({
        success: false,
        error: "cargoType and route are required for analysis",
      });
    }

    let safetyScore = 100;
    let issues = [];
    let suggestions = [];

    // Cargo type risk
    switch (cargoType.toLowerCase()) {
      case "fragile":
        safetyScore -= 20;
        issues.push("Fragile cargo: handle with extra care");
        suggestions.push("Add padding and avoid sudden stops");
        break;
      case "perishable":
        safetyScore -= 15;
        issues.push("Perishable cargo: time-sensitive delivery");
        suggestions.push("Ensure refrigeration and monitor transit time");
        break;
      case "hazardous":
        safetyScore -= 30;
        issues.push("Hazardous cargo: high-risk shipment");
        suggestions.push("Follow safety regulations and emergency protocols");
        break;
      default:
        issues.push("Standard cargo: normal handling");
        suggestions.push("No special handling needed");
    }

    // Vehicle type risk
    if (vehicleType) {
      switch (vehicleType.toLowerCase()) {
        case "truck":
          safetyScore -= 5;
          issues.push("Truck transport: moderate road risk");
          suggestions.push("Check vehicle condition and road conditions");
          break;
        case "ship":
          safetyScore -= 10;
          issues.push("Ship transport: possible weather and sea risk");
          suggestions.push("Monitor sea conditions and anchor safely");
          break;
        case "plane":
          safetyScore -= 5;
          issues.push("Air transport: moderate altitude & weather risk");
          suggestions.push("Ensure cargo is secured properly for flight");
          break;
        case "train":
          safetyScore -= 7;
          issues.push("Train transport: possible delays and track issues");
          suggestions.push("Monitor track status and train schedules");
          break;
        default:
          suggestions.push("Unknown vehicle type: monitor transport carefully");
      }
    }

    // Route-based risk
    const stops = route.split("->").length - 1;
    if (stops > 2) {
      safetyScore -= 10;
      issues.push("Long route with multiple stops: higher risk of delays");
      suggestions.push("Plan route carefully and monitor shipment during stops");
    }

    // Weather-related risk
    if (additionalData) {
      const weatherData = additionalData.toLowerCase();
      if (weatherData.includes("rain") || weatherData.includes("storm")) {
        safetyScore -= 5;
        issues.push("Weather risk: rain or storm expected");
        suggestions.push("Use weatherproof packaging and allow extra transit time");
      }
      if (weatherData.includes("snow")) {
        safetyScore -= 7;
        issues.push("Weather risk: snow may delay transport");
        suggestions.push("Plan alternate routes or delay if possible");
      }
    }

    // ETA urgency
    if (etaHours !== undefined) {
      const penalty = calculateUrgencyPenalty(Number(etaHours));
      if (penalty > 0) {
        safetyScore -= penalty;
        issues.push(`High urgency: ETA is ${etaHours} hours`);
        suggestions.push("Speed up handling but maintain safety measures");
      }
    }

    // Randomize slightly
    safetyScore = randomizeScore(safetyScore, 5);

    // Final response
    res.json({
      success: true,
      cargoType,
      route,
      vehicleType: vehicleType || "Not specified",
      etaHours: etaHours || "Not specified",
      safetyScore,
      issues,
      suggestions,
      analysis: `Predicted shipment safety score is ${safetyScore}. Issues: ${issues.join(
        ", "
      )}. Suggestions: ${suggestions.join("; ")}`,
    });
  } catch (error) {
    console.error("Local AI Prediction Error:", error.message);
    res.status(500).json({
      success: false,
      error: "Local AI analysis failed",
      details: error.message,
    });
  }
});

export default router;
