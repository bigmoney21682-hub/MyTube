// File: server.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch"; // Use fetch for YouTube API

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;
const API_KEY = process.env.YOUTUBE_API_KEY; // Your API key in .env

if (!API_KEY) {
  console.error("YOUTUBE_API_KEY not set in environment variables!");
  process.exit(1);
}

app.use(cors({ origin: "*" }));
app.use(express.json());

/* ===================== HELPER FUNCTIONS ===================== */

async function youtubeSearch(q) {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=20&q=${encodeURIComponent(
    q
  )}&key=${API_KEY}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("YouTube search failed");
  const data = await res.json();

  return data.items.map((item) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails?.high?.url,
    uploaderName: item.snippet.channelTitle,
  }));
}

async function youtubeTrending(region = "US") {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&chart=mostPopular&regionCode=${region}&maxResults=20&key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("YouTube trending failed");
  const data = await res.json();

  return data.items.map((item) => ({
    id: item.id,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails?.high?.url,
    uploaderName: item.snippet.channelTitle,
    views: item.statistics.viewCount,
    duration: item.contentDetails.duration, // ISO 8601 format
  }));
}

async function youtubeVideoInfo(id) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${id}&key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("YouTube video info failed");
  const data = await res.json();
  if (!data.items || data.items.length === 0) return null;

  const item = data.items[0];
  return {
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails?.high?.url,
    uploaderName: item.snippet.channelTitle,
    views: item.statistics.viewCount,
    duration: item.contentDetails.duration,
  };
}

/* ===================== ROUTES ===================== */

app.get("/search", async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) return res.json([]);
    const results = await youtubeSearch(q);
    res.json(results);
  } catch (e) {
    console.error("Search error:", e);
    res.status(500).json({ error: "search failed" });
  }
});

app.get("/trending", async (req, res) => {
  try {
    const region = req.query.region || "US";
    const results = await youtubeTrending(region);
    res.json(results);
  } catch (e) {
    console.error("Trending error:", e);
    res.status(500).json([]);
  }
});

app.get("/video", async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) return res.status(400).json({ error: "missing id" });
    const info = await youtubeVideoInfo(id);
    if (!info) return res.status(404).json({ error: "video not playable" });
    res.json(info);
  } catch (e) {
    console.error("Video info error:", e);
    res.status(500).json({ error: "video failed" });
  }
});

/* ===================== HEALTH & KEEP-ALIVE ===================== */

app.get("/health", (req, res) => res.status(200).send("OK"));
app.get("/ping", (req, res) => res.status(200).send("pong"));
app.get("/", (req, res) =>
  res.json({
    message: "MyTube backend is running!",
    timestamp: new Date().toISOString(),
  })
);

/* ===================== START ===================== */

app.listen(PORT, () => {
  console.log(`MyTube backend running on port ${PORT}`);
  console.log(`Health check: /health`);
  console.log(`Ping endpoint: /ping`);
});
