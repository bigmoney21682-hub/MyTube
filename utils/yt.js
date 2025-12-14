import youtubedl from 'youtube-dl-exec';

/**
 * Normalize formats safely
 */
function extractFormats(formats = []) {
  return formats
    .filter(f => f.url && typeof f.url === 'string')
    .map(f => ({
      format_id: f.format_id,
      ext: f.ext || null,
      height: f.height || null,
      fps: f.fps || null,
      filesize: f.filesize || null,
      vcodec: f.vcodec || 'none',
      acodec: f.acodec || 'none',
      url: f.url
    }))
    .sort((a, b) => (b.height || 0) - (a.height || 0));
}

/**
 * Get single video info
 */
export async function getVideoInfo(videoId) {
  const url = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    const info = await youtubedl(url, {
      dumpSingleJson: true,
      skipDownload: true,
      noWarnings: true
    });

    return {
      id: info.id,
      title: info.title,
      thumbnail: info.thumbnail,
      duration: info.duration,
      uploader: info.uploader,
      view_count: info.view_count,
      formats: extractFormats(info.formats),
      best_url: info.url || null
    };
  } catch (err) {
    console.error('[yt-dlp video error]', err);
    throw new Error(`yt-dlp error: ${err.message}`);
  }
}

/**
 * Search videos
 */
export async function searchVideos(query, limit = 10) {
  try {
    const info = await youtubedl(`ytsearch${limit}:${query}`, {
      dumpSingleJson: true,
      skipDownload: true,
      noWarnings: true
    });

    return (info.entries || []).map(v => ({
      id: v.id,
      title: v.title,
      thumbnail: v.thumbnail,
      duration: v.duration,
      uploader: v.uploader,
      view_count: v.view_count,
      formats: extractFormats(v.formats),
      best_url: v.url || null
    }));
  } catch (err) {
    console.error('[yt-dlp search error]', err);
    throw new Error(`yt-dlp search error: ${err.message}`);
  }
}

/**
 * Trending videos
 */
export async function getTrending(limit = 10) {
  try {
    const info = await youtubedl('https://www.youtube.com/feed/trending', {
      dumpSingleJson: true,
      skipDownload: true,
      noWarnings: true
    });

    return (info.entries || []).slice(0, limit).map(v => ({
      id: v.id,
      title: v.title,
      thumbnail: v.thumbnail,
      duration: v.duration,
      uploader: v.uploader,
      view_count: v.view_count,
      formats: extractFormats(v.formats),
      best_url: v.url || null
    }));
  } catch (err) {
    console.error('[yt-dlp trending error]', err);
    throw new Error(`yt-dlp trending error: ${err.message}`);
  }
}

/**
 * Channel videos
 */
export async function getChannel(channelId, limit = 10) {
  try {
    const info = await youtubedl(
      `https://www.youtube.com/channel/${channelId}`,
      {
        dumpSingleJson: true,
        skipDownload: true,
        noWarnings: true
      }
    );

    return (info.entries || []).slice(0, limit).map(v => ({
      id: v.id,
      title: v.title,
      thumbnail: v.thumbnail,
      duration: v.duration,
      uploader: info.uploader,
      view_count: v.view_count,
      formats: extractFormats(v.formats),
      best_url: v.url || null
    }));
  } catch (err) {
    console.error('[yt-dlp channel error]', err);
    throw new Error(`yt-dlp channel error: ${err.message}`);
  }
}
