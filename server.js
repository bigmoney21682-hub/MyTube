import express from "express";
import cors from "cors";
import ytdlp from "yt-dlp-exec";

const app = express();
const PORT = process.env.PORT || 3000;

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
/* SEARCH              */
/* -------------------- */
app.get("/search", async (req, res) => {
  const q = req.query.q;
  if (!q) return res.json([]);

  try {
    const data = await ytdlp(`ytsearch15:${q}`, {
      dumpSingleJson: true,
      skipDownload: true
    });

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
    const data = await ytdlp(
      "https://www.youtube.com/feed/trending",
      {
        dumpSingleJson: true,
        flatPlaylist: true,
        skipDownload: true
      }
    );

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
    const data = await ytdlp(
      `https://www.youtube.com/watch?v=${id}`,
      {
        dumpSingleJson: true,
        noWarnings: true,
        noCheckCertificates: true,
        preferFreeFormats: true,
        youtubeSkipDashManifest: true
      }
    );

    // ✅ CACHE STORE (limit size)
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
