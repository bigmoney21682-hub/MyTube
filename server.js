// Filename: server.js
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
const PORT = process.env.PORT || 10000;

// Setup CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  methods: ["GET", "POST"]
}));

app.use(express.json());

// ==========================
// ROUTES
// ==========================

// Trending videos
app.get("/trending", async (req, res) => {
  try {
    const videos = await getTrending();
    res.json(videos || []);
  } catch (err) {
    console.error("Trending route error:", err.message);
    res.json([]); // always return empty array instead of 500
  }
});

// Search videos
app.get("/search", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]); // safe fallback

  try {
    const videos = await searchVideos(q);
    res.json(videos || []);
  } catch (err) {
    console.error("Search route error:", err.message);
    res.json([]); // fallback
  }
});

// Video details
app.get("/video/:id", async (req, res) => {
  const { id } = req.params;
  if (!id) return res.json({ id, title: "Invalid video", thumbnail: "", duration: 0, uploader: "Unknown", view_count: 0, formats: [] });

  try {
    const video = await getVideoInfo(id);
    res.json(video || {
      id,
      title: "Video unavailable",
      thumbnail: "https://i.ytimg.com/vi/0/hqdefault.jpg",
      duration: 0,
      uploader: "Unknown",
      view_count: 0,
      formats: []
    });
  } catch (err) {
    console.error(`Video route error (${id}):`, err.message);
    res.json({
      id,
      title: "Video unavailable",
      thumbnail: "https://i.ytimg.com/vi/0/hqdefault.jpg",
      duration: 0,
      uploader: "Unknown",
      view_count: 0,
      formats: []
    });
  }
});

// Channel videos
app.get("/channel/:id", async (req, res) => {
  const { id } = req.params;
  if (!id) return res.json([]);
  try {
    const videos = await getChannel(id);
    res.json(videos || []);
  } catch (err) {
    console.error(`Channel route error (${id}):`, err.message);
    res.json([]);
  }
});

// ==========================
// Serve frontend (optional)
// ==========================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));
app.get("*", (req, res) => {
  const indexFile = path.join(__dirname, "public", "index.html");
  res.sendFile(indexFile, err => {
    if (err) {
      console.error("Frontend file error:", err.message);
      res.status(404).send("Frontend not found");
    }
  });
});

// ==========================
// START SERVER
// ==========================
app.listen(PORT, () => {
  console.log(`\n==> ///////////////////////////////////////////////////////////`);
  console.log(`==> MyTube backend running at http://localhost:${PORT}`);
  console.log(`==> Available at your primary URL ${process.env.RENDER_EXTERNAL_URL || ""}`);
  console.log(`==> ///////////////////////////////////////////////////////////\n`);
});
