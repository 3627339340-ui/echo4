// api/weather.js
import express from "express";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const QWEATHER_API_KEY = process.env.QWEATHER_API_KEY || "bcb0eed78d5e479bac3b885e1c152e6e"; // fallback to provided sample

// GET /api/weather?lat=...&lon=...  or ?q=cityName
router.get("/", async (req, res) => {
  const { lat, lon, q } = req.query;

  try {
    // QWeather: location is "lon,lat" or city id/name depending on account
    let location = "0,0";
    if (lat && lon) location = `${lon},${lat}`;
    else if (q) location = q;

    const url = `https://devapi.qweather.com/v7/weather/now?location=${encodeURIComponent(location)}&key=${QWEATHER_API_KEY}`;
    const r = await axios.get(url, { timeout: 10000 });
    const data = r.data;

    // QWeather returns now object
    const now = data?.now || {};
    const weather = {
      main: now?.text || now?.category || "Clear",
      description: now?.text || "",
      temp: Math.round(Number(now?.temp || 0)),
      icon: now?.icon || "100"
    };

    return res.json({ source: "qweather", weather, city: (data?.location?.name || q || "") });
  } catch (err) {
    console.error("QWeather fetch error:", err?.response?.data || err?.message || err);
    // fallback mock
    return res.json({ source: "mock", weather: { main: "Clear", description: "晴朗", temp: 22, icon: "100" }, city: q || "未知" });
  }
});

export default router;
