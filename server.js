import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import {
  searchVideos,
  getTrending,
  getVideoInfo,
  getChannel,
  getRelated
} from "./utils/yt.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors({ origin: "*" }));
app.use(express.json());

/* ===================== ROUTES ===================== */

app.get("/search", async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) return res.json([]);
    res.json(await searchVideos(q));
  } catch (e) {
    console.error("Search error:", e);
    res.status(500).json({ error: "search failed" });
  }
});

app.get("/trending", async (req, res) => {
  try {
    res.json(await getTrending());
  } catch (e) {
    console.error("Trending error:", e);
    res.status(500).json([]);
  }
});

app.get("/video", async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) return res.status(400).json({ error: "missing id" });
    const info = await getVideoInfo(id);
    if (!info) return res.status(404).json({ error: "video not playable" });
    res.json(info);
  } catch (e) {
    console.error("Video info error:", e);
    res.status(500).json({ error: "video failed" });
  }
});

app.get("/related", async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) return res.status(400).json({ error: "missing id" });
    res.json(await getRelated(id));
  } catch (e) {
    console.error("Related error:", e);
    res.status(500).json([]);
  }
});

app.get("/channel/:id", async (req, res) => {
  try {
    const { id } = req.params;
    res.json(await getChannel(id));
  } catch (e) {
    console.error("Channel error:", e);
    res.status(500).json([]);
  }
});

/* ===================== HEALTH & KEEP-ALIVE ===================== */

// Simple health check endpoint
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Lightweight ping endpoint – perfect for uptime monitors
app.get("/ping", (req, res) => {
  res.status(200).send("pong");
});

// Optional: root endpoint to confirm server is running
app.get("/", (req, res) => {
  res.json({ message: "MyTube backend is running!", timestamp: new Date().toISOString() });
});

/* ===================== START ===================== */

app.listen(PORT, () => {
  console.log(`MyTube backend running on port ${PORT}`);
  console.log(`Health check: https://mytube-nffp.onrender.com/health`);
  console.log(`Ping endpoint: https://mytube-nffp.onrender.com/ping`);
});
