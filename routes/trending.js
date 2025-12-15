// Example: /routes/trending.js
import express from 'express';
import { getTrending } from '../utils/yt.js';
import NodeCache from 'node-cache';

const router = express.Router();
const cache = new NodeCache({ stdTTL: 60 }); // cache for 60s

router.get('/', async (req, res) => {
  try {
    const cached = cache.get('trending');
    if (cached) return res.json(cached);

    const videos = await getTrending();
    const lightVideos = videos.map(v => ({
      id: v.id,
      title: v.title,
      thumbnail: v.thumbnail,
      duration: v.duration,
      uploader: v.uploader,
      view_count: v.view_count,
    }));

    cache.set('trending', lightVideos);
    res.json(lightVideos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch trending' });
  }
});

export default router;
