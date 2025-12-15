import express from "express";
import cors from "cors";
import { spawn } from "child_process";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 3000;

/* ===============================
   yt-dlp PATH (RENDER SAFE)
================================ */
const YTDLP_PATH =
  process.env.YTDLP_PATH ||
  "/opt/render/project/src/bin/yt-dlp";

if (!fs.existsSync(YTDLP_PATH)) {
  console.error("❌ yt-dlp not found at:", YTDLP_PATH);
  process.exit(1);
}

console.log("✅ yt-dlp found at:", YTDLP_PATH);

/* ===============================
   CORS
================================ */
app.use(
  cors({
    origin: [
      "https://bigmoney21682-hub.github.io",
      "http://localhost:5173",
      "http://localhost:3000"
    ]
  })
);

app.use(express.json());

/* ===============================
   yt-dlp helper
================================ */
function runYtDlp(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(YTDLP_PATH, args);

    let out = "";
    let err = "";

    proc.stdout.on("data", d => (out += d));
    proc.stderr.on("data", d => (err += d));

    proc.on("close", code => {
      if (code !== 0) return reject(err || "yt-dlp failed");

      try {
        resolve(JSON.parse(out));
      } catch {
        reject("Invalid JSON from yt-dlp");
      }
    });
  });
}

/* ===============================
   HEALTH CHECK (KEEPS APP ALIVE)
================================ */
app.get("/", (_req, res) => {
  res.send("✅ MyTube backend alive");
});

/* ===============================
   SEARCH
================================ */
app.get("/search", async (req, res) => {
  try {
    const data = await runYtDlp([
      `ytsearch20:${req.query.q}`,
      "--dump-json",
      "--flat-playlist",
      "--no-warnings"
    ]);

    const list = Array.isArray(data) ? data : [data];

    res.json(
      list.map(v => ({
        id: v.id,
        title: v.title,
        thumbnail: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
        duration: v.duration,
        uploader: v.uploader,
        view_count: v.view_count
      }))
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Search failed" });
  }
});

/* ===============================
   TRENDING
================================ */
app.get("/trending", async (_req, res) => {
  try {
    const data = await runYtDlp([
      "https://www.youtube.com/feed/trending",
      "--dump-json",
      "--flat-playlist",
      "--no-warnings"
    ]);

    const list = Array.isArray(data) ? data : [data];

    res.json(
      list.map(v => ({
        id: v.id,
        title: v.title,
        thumbnail: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
        duration: v.duration,
        uploader: v.uploader,
        view_count: v.view_count
      }))
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Trending failed" });
  }
});

/* ===============================
   VIDEO
================================ */
app.get("/video", async (req, res) => {
  try {
    const data = await runYtDlp([
      `https://www.youtube.com/watch?v=${req.query.id}`,
      "--dump-json",
      "--no-warnings"
    ]);

    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Video failed" });
  }
});

/* ===============================
   RELATED
================================ */
app.get("/related", async (req, res) => {
  try {
    const data = await runYtDlp([
      `https://www.youtube.com/watch?v=${req.query.id}`,
      "--dump-json",
      "--flat-playlist",
      "--playlist-end",
      "20",
      "--no-warnings"
    ]);

    const list = Array.isArray(data) ? data : [data];

    res.json(
      list.map(v => ({
        id: v.id,
        title: v.title,
        thumbnail: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
        duration: v.duration,
        uploader: v.uploader,
        view_count: v.view_count
      }))
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Related failed" });
  }
});

/* ===============================
   START
================================ */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 MyTube backend running on port ${PORT}`);
});
