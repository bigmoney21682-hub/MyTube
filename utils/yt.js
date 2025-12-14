import ytdl from 'youtube-dl-exec';

// Simplified - just get metadata, no formats
export async function getVideoInfo(videoId) {
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  
  try {
    const info = await ytdl(url, {
      dumpSingleJson: true,
      noWarnings: true,
      skipDownload: true,
      // Add timeout and lighter options
      timeout: 30000, // 30s timeout
    });

    return {
      id: info.id,
      title: info.title || 'Unknown',
      thumbnail: info.thumbnail,
      duration: info.duration,
      uploader: info.uploader,
      view_count: info.view_count || 0,
      // Skip formats entirely to avoid crashes
      best_url: null, // Frontend can use YouTube embed instead
    };
  } catch (error) {
    console.error(`ytdl failed for ${videoId}:`, error.message);
    throw new Error(`Video fetch failed: ${error.message}`);
  }
}

// Keep search as-is since it works
export async function searchVideos(query, limit = 10) {
  const output = await ytdl(`ytsearch${limit}:${query}`, {
    dumpSingleJson: true,
    flatPlaylist: true,
  });

  return output.entries.map(item => ({
    id: item.id,
    title: item.title,
    thumbnail: item.thumbnail,
    uploader: item.uploader,
    duration: item.duration,
  }));
}
