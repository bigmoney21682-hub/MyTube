import express from "express";
import cache from "../cache.js";
import { runYtDlp } from "../utils/yt.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: "Missing ?q=" });

  const cacheKey = `search_${q}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  try {
    const data = await runYtDlp(`ytsearch10:${q}`);
    cache.set(cacheKey, data, 600);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "yt-dlp failed", details: e.message });
  }
});

export default router;
