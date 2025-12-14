import ytdl from 'youtube-dl-exec';

function extractFormats(formats) {
  if (!formats || !Array.isArray(formats)) return [];
  return formats
    .filter(f => f.url && f.protocol?.startsWith('http'))
    .map(f => ({
      format_id: f.format_id,
      url: f.url,
      ext: f.ext,
      height: f.height || null,
      fps: f.fps || null,
      filesize: f.filesize || null,
      acodec: f.acodec || 'none',
      vcodec: f.vcodec || 'none',
    }))
    .sort((a, b) => (b.height || 0) - (a.height || 0));
}

export async function getVideoInfo(videoId) {
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  
  try {
    const info = await ytdl(url, {
      dumpSingleJson: true,
      noWarnings: true,
      skipDownload: true,
      timeout: 30000, // Add timeout
    });

    return {
      id: info.id,
      title: info.title || 'Unknown',
      thumbnail: info.thumbnail,
      duration: info.duration,
      uploader: info.uploader || 'Unknown',
      view_count: info.view_count || 0,
      formats: extractFormats(info.formats), // Keep your format logic
      best_url: info.url || null,
    };
  } catch (error) {
    console.error(`ytdl failed for ${videoId}:`, error.message);
    throw new Error(`Video fetch failed: ${error.message}`);
  }
}

// Keep search/trending/channel unchanged
