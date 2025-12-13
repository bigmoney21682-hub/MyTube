import express from 'express';
import { getVideoInfo } from '../utils/yt.js';
import { cachedCall } from '../cache.js';

const router = express.Router();

router.get('/:videoId', async (req, res) => {
  const { videoId } = req.params;
  try {
    const data = await cachedCall(`video:${videoId}`, getVideoInfo, videoId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
