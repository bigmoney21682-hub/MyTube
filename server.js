import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import {
  searchVideos,
  getTrending,
  getVideoInfo,
  getChannel,
} from "./utils/yt.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// -------------------
// Middleware
// -------------------
app.use(cors()); // allows all origins by default
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// -------------------
// Routes
// -------------------

// GET /search?q=some+query
app.get("/search", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "Missing query parameter 'q'" });
  try {
    const results = await searchVideos(q);
    res.json(results);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /trending?region=US
app.get("/trending", async (req, res) => {
  const region = req.query.region || "US";
  try {
    const results = await getTrending(region);
    res.json(results);
  } catch (err) {
    console.error("Trending error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /video/:id
app.get("/video/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const info = await getVideoInfo(id);
    res.json(info);
  } catch (err) {
    console.error("Video info error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /channel/:id
app.get("/channel/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const videos = await getChannel(id);
    res.json(videos);
  } catch (err) {
    console.error("Channel error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Catch-all
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// -------------------
// Start server
// -------------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
