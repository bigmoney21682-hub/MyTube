import express from 'express';
import { getVideoInfo } from '../utils/yt.js';
import { cachedCall } from '../cache.js';

const router = express.Router();

router.get('/:videoId', async (req, res) => {
  const { videoId } = req.params;
  
  // Validate ID first
  if (!videoId || videoId.length !== 11) {
    return res.status(400).json({ error: 'Invalid video ID' });
  }

  try {
    console.log(`Fetching video: ${videoId}`);
    const data = await cachedCall(`video:${videoId}`, getVideoInfo, videoId);
    
    // SAFE FORMAT HANDLING - no crash if formats missing
    let bestUrl = null;
    if (data.formats && Array.isArray(data.formats) && data.formats.length > 0) {
      // Your existing smart logic, but defensive
      const progressive = data.formats
        .filter(f => f.vcodec !== 'none' && f.acodec !== 'none')
        .sort((a, b) => (b.height || 0) - (a.height || 0));
      
      bestUrl = progressive[0]?.url || data.best_url || data.formats[0]?.url;
    }
    
    // Only override if we found something
    if (bestUrl) {
      data.best_url = bestUrl;
    }

    res.json(data);
  } catch (err) {
    console.error(`Video ${videoId} error:`, err.message);
    res.status(500).json({ error: 'Video unavailable', details: err.message });
  }
});

export default router;
