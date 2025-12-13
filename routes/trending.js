import express from 'express';
import { getTrending } from '../utils/yt.js';
import { cachedCall } from '../cache.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { limit = 20 } = req.query;
  try {
    const data = await cachedCall(`trending:${limit}`, getTrending, parseInt(limit));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
