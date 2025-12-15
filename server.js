import express from "express";
import cors from "cors";
import { spawn } from "child_process";

const app = express();
const PORT = process.env.PORT || 3000;

// Path to yt-dlp binary (Render)
const YTDLP = process.env.YTDLP_PATH || "yt-dlp";

app.use(cors());
app.use(express.json());

/* -------------------- */
/* SIMPLE IN-MEM CACHE */
/* -------------------- */
const videoCache = new Map();

/* -------------------- */
/* HEALTH CHECK        */
/* -------------------- */
app.get("/", (req, res) => {
  res.send("MyTube backend running");
});

/* -------------------- */
/* HELPER: RUN yt-dlp  */
/* -------------------- */
function runYtDlp(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(YTDLP, args);
    let out = "";
    let err = "";

    proc.stdout.on("data", d => (out += d));
    proc.stderr.on("data", d => (err += d));

    proc.on("close", code => {
      if (code !== 0) {
        reject(err || "yt-dlp failed");
      } else {
        try {
          resolve(JSON.parse(out));
        } catch (e) {
          reject("Invalid yt-dlp JSON");
        }
      }
    });
  });
}

/* -------------------- */
/* SEARCH              */
/* -------------------- */
app.get("/search", async (req, res) => {
  const q = req.query.q;
  if (!q) return res.json([]);

  try {
    const data = await runYtDlp([
      `ytsearch15:${q}`,
      "--dump-single-json",
      "--skip-download"
    ]);

    const results = (data.entries || []).map(v => ({
      id: v.id,
      title: v.title,
      thumbnail: v.thumbnail,
      uploader: v.uploader,
      view_count: v.view_count || 0
    }));

    res.json(results);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json([]);
  }
});

/* -------------------- */
/* TRENDING             */
/* -------------------- */
app.get("/trending", async (req, res) => {
  try {
    const data = await runYtDlp([
      "https://www.youtube.com/feed/trending",
      "--dump-single-json",
      "--flat-playlist",
      "--skip-download"
    ]);

    const videos = (data.entries || []).map(v => ({
      id: v.id,
      title: v.title,
      thumbnail: v.thumbnail,
      uploader: v.uploader,
      view_count: v.view_count || 0
    }));

    res.json(videos);
  } catch (err) {
    console.error("Trending error:", err);
    res.status(500).json([]);
  }
});

/* -------------------- */
/* VIDEO (CACHED)      */
/* -------------------- */
app.get("/video", async (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).json({ error: "Missing id" });

  // ✅ CACHE HIT
  if (videoCache.has(id)) {
    return res.json(videoCache.get(id));
  }

  try {
    const data = await runYtDlp([
      `https://www.youtube.com/watch?v=${id}`,
      "--dump-single-json",
      "--no-warnings",
      "--no-check-certificates",
      "--prefer-free-formats",
      "--youtube-skip-dash-manifest"
    ]);

    // Cache limit
    if (videoCache.size > 50) {
      const firstKey = videoCache.keys().next().value;
      videoCache.delete(firstKey);
    }

    videoCache.set(id, data);
    res.json(data);
  } catch (err) {
    console.error("Video error:", err);
    res.status(500).json({ error: "yt-dlp failed" });
  }
});

/* -------------------- */
/* START SERVER        */
/* -------------------- */
app.listen(PORT, () => {
  console.log(`MyTube backend running on port ${PORT}`);
});
