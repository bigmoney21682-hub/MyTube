import express from "express";
import { getVideoInfo } from "../utils/yt.js";
import { cachedCall } from "../cache.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "Query parameter 'id' required" });
  try {
    const data = await cachedCall(`video:${id}`, getVideoInfo, id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
