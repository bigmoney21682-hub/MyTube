// server.js
import express from "express";
import cors from "cors";
import { searchVideos, getVideoInfo } from "./utils/yt.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// SEARCH
app.get("/search", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "Missing query" });
  try {
    const videos = await searchVideos(q);
    res.json(videos);
  } catch (err) {
    console.error("Search error:", err.message);
    res.status(500).json({ error: "Failed to search videos" });
  }
});

// VIDEO INFO
app.get("/video/:id", async (req, res) => {
  try {
    const video = await getVideoInfo(req.params.id);
    res.json(video);
  } catch (err) {
    console.error("Video error:", err.message);
    res.status(500).json({ error: "Failed to fetch video info" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
