import express from "express";
import cache from "../cache.js";
import { runYtDlp } from "../utils/yt.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).json({ error: "Missing ?id=xxxx" });

  const cacheKey = `video_${id}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  try {
    const data = await runYtDlp(`https://www.youtube.com/watch?v=${id}`);
    cache.set(cacheKey, data, 3600);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "yt-dlp failed", details: e.message });
  }
});

export default router;
