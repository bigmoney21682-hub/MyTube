import express from 'express';
import { getChannel } from '../utils/yt.js';
import { cachedCall } from '../cache.js';

const router = express.Router();

router.get('/:channelId', async (req, res) => {
  const { channelId } = req.params;
  const { limit = 20 } = req.query;
  try {
    const data = await cachedCall(`channel:${channelId}:${limit}`, getChannel, channelId, parseInt(limit));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
