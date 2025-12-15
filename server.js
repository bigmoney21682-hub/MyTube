// Filename: server.js
import express from "express";
import cors from "cors";
import {
  searchVideos,
  getTrending,
  getVideoInfo,
  getRelated
} from "./utils/yt.js";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

/* ================= SEARCH ================= */
app.get("/search", async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) return res.json([]);

    const results = await searchVideos(q);
    res.json(results);
  } catch (err) {
    console.error("Search error:", err.message);
    res.status(500).json({ error: "Search failed" });
  }
});

/* ================= TRENDING ================= */
app.get("/trending", async (req, res) => {
  try {
    const videos = await getTrending();
    res.json(videos);
  } catch (err) {
    console.error("Trending error:", err.message);
    res.status(500).json([]);
  }
});

/* ================= VIDEO ================= */
app.get("/video", async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) return res.status(400).json({ error: "Missing id" });

    const info = await getVideoInfo(id);
    res.json(info);
  } catch (err) {
    console.error("Video error:", err.message);
    res.status(500).json({ error: "Failed to load video" });
  }
});

/* ================= RELATED ================= */
app.get("/related", async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) return res.json([]);

    const videos = await getRelated(id);
    res.json(videos);
  } catch (err) {
    console.error("Related error:", err.message);
    res.json([]);
  }
});

/* ================= HEALTH ================= */
app.get("/", (req, res) => {
  res.send("MyTube backend running ✅");
});

app.listen(PORT, () => {
  console.log(`MyTube backend running on port ${PORT}`);
});
