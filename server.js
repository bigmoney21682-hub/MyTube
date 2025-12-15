import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import {
  searchVideos,
  getTrending,
  getVideoInfo,
  getChannel
} from "./utils/yt.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Setup CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || "*", // change to your frontend URL in production
  methods: ["GET", "POST"]
}));

app.use(express.json());

// Routes
app.get("/trending", async (req, res) => {
  try {
    const videos = await getTrending();
    res.json(videos);
  } catch (err) {
    console.error("Trending route error:", err.message);
    res.status(500).json({ error: "Failed to fetch trending videos" });
  }
});

app.get("/search", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "Missing search query" });

  try {
    const videos = await searchVideos(q);
    res.json(videos);
  } catch (err) {
    console.error("Search route error:", err.message);
    res.status(500).json({ error: "Failed to search videos" });
  }
});

app.get("/video/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const video = await getVideoInfo(id);
    res.json(video);
  } catch (err) {
    console.error("Video route error:", err.message);
    res.status(500).json({ error: "Failed to fetch video info" });
  }
});

app.get("/channel/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const videos = await getChannel(id);
    res.json(videos);
  } catch (err) {
    console.error("Channel route error:", err.message);
    res.status(500).json({ error: "Failed to fetch channel videos" });
  }
});

// Optional: serve frontend in production
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`\n==> ///////////////////////////////////////////////////////////`);
  console.log(`==> MyTube backend running at http://localhost:${PORT}`);
  console.log(`==> ///////////////////////////////////////////////////////////\n`);
});
