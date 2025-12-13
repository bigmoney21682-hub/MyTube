import express from 'express';
import { searchVideos } from '../utils/yt.js';
import { cachedCall } from '../cache.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { q, limit = 10 } = req.query;
  if (!q) return res.status(400).json({ error: 'Query parameter "q" required' });
  try {
    const data = await cachedCall(`search:${q}:${limit}`, searchVideos, q, parseInt(limit));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
