import express from 'express';
import { getVideoInfo } from '../utils/yt.js';
import { cachedCall } from '../cache.js';

const router = express.Router();

// Main info endpoint - now with smarter best_url that includes audio
router.get('/:videoId', async (req, res) => {
  const { videoId } = req.params;
  try {
    const data = await cachedCall(`video:${videoId}`, getVideoInfo, videoId);

    // === SMART BEST URL LOGIC ===
    let bestUrl = null;

    // Priority 1: Best progressive format with video + audio (usually 720p or 1080p mp4)
    const progressive = data.formats
      .filter(f => f.vcodec !== 'none' && f.acodec !== 'none')
      .sort((a, b) => (b.height || 0) - (a.height || 0));

    if (progressive.length > 0) {
      bestUrl = progressive[0].url;  // e.g., 720p mp4 with audio
    } else {
      // Priority 2: Fallback to highest video + assume client merges (rare)
      // Or just use the old best_url if no progressive available
      bestUrl = data.best_url || data.formats[0]?.url;
    }

    // Override with our smart choice
    data.best_url = bestUrl;

    res.json(data);
  } catch (err) {
    console.error('Video route error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
