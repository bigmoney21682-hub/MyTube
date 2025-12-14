import ytdl from "youtube-dl-exec";

/**
 * Explicit yt-dlp binary path (Render-safe)
 */
const YTDLP_PATH = process.env.YTDLP_PATH || "yt-dlp";

/**
 * Extract and normalize formats
 */
function extractFormats(formats) {
  if (!Array.isArray(formats)) return [];

  return formats
    .filter(f =>
      f.url &&
      typeof f.url === "string" &&
      f.protocol &&
      f.protocol.startsWith("http")
    )
    .map(f => ({
      format_id: f.format_id,
      url: f.url,
      ext: f.ext || null,
      height: f.height || null,
      fps: f.fps || null,
      filesize: f.filesize || null,
      acodec: f.acodec || "none",
      vcodec: f.vcodec || "none",
    }))
    .sort((a, b) => (b.height || 0) - (a.height || 0));
}

/**
 * Fetch full video metadata + formats
 */
export async function getVideoInfo(videoId) {
  const url = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    const info = await ytdl(url, {
      dumpSingleJson: true,
      skipDownload: true,
      noWarnings: true,
      socketTimeout: 30000,
      ytdlpPath: YTDLP_PATH,
    });

    return {
      id: info.id,
      title: info.title || "Unknown",
      thumbnail: info.thumbnail || null,
      duration: info.duration || 0,
      uploader: info.uploader || "Unknown",
      view_count: info.view_count || 0,
      formats: extractFormats(info.formats),
      best_url: info.url || null,
    };
  } catch (err) {
    console.error(`[yt-dlp] Failed for ${videoId}:`, err.message);
    throw new Error(`yt-dlp error: ${err.message}`);
  }
}

/**
 * Search videos on YouTube
 */
export async function searchVideos(query, limit = 10) {
  if (!query) return [];

  const url = `ytsearch${limit}:${query}`;

  try {
    const info = await ytdl(url, {
      dumpSingleJson: true,
      skipDownload: true,
      noWarnings: true,
      socketTimeout: 30000,
      ytdlpPath: YTDLP_PATH,
    });

    return (info.entries || []).map(video => ({
      id: video.id,
      title: video.title || "Unknown",
      thumbnail: video.thumbnail || null,
      duration: video.duration || 0,
      uploader: video.uploader || "Unknown",
      view_count: video.view_count || 0,
      formats: extractFormats(video.formats),
      best_url: video.url || null,
    }));
  } catch (err) {
    console.error(`[yt-dlp] Search failed for "${query}":`, err.message);
    throw new Error(`yt-dlp search error: ${err.message}`);
  }
}

/**
 * Fetch trending videos
 */
export async function getTrending(limit = 10) {
  const url = `https://www.youtube.com/feed/trending`;

  try {
    const info = await ytdl(url, {
      dumpSingleJson: true,
      skipDownload: true,
      noWarnings: true,
      socketTimeout: 30000,
      ytdlpPath: YTDLP_PATH,
    });

    return (info.entries || []).slice(0, limit).map(video => ({
      id: video.id,
      title: video.title || "Unknown",
      thumbnail: video.thumbnail || null,
      duration: video.duration || 0,
      uploader: video.uploader || "Unknown",
      view_count: video.view_count || 0,
      formats: extractFormats(video.formats),
      best_url: video.url || null,
    }));
  } catch (err) {
    console.error(`[yt-dlp] Trending fetch failed:`, err.message);
    throw new Error(`yt-dlp trending error: ${err.message}`);
  }
}

/**
 * Fetch all videos from a channel
 */
export async function getChannelVideos(channelId, limit = 10) {
  if (!channelId) return [];

  const url = `https://www.youtube.com/channel/${channelId}`;

  try {
    const info = await ytdl(url, {
      dumpSingleJson: true,
      skipDownload: true,
      noWarnings: true,
      socketTimeout: 30000,
      ytdlpPath: YTDLP_PATH,
    });

    return (info.entries || []).slice(0, limit).map(video => ({
      id: video.id,
      title: video.title || "Unknown",
      thumbnail: video.thumbnail || null,
      duration: video.duration || 0,
      uploader: info.uploader || "Unknown",
      view_count: video.view_count || 0,
      formats: extractFormats(video.formats),
      best_url: video.url || null,
    }));
  } catch (err) {
    console.error(`[yt-dlp] Channel fetch failed for "${channelId}":`, err.message);
    throw new Error(`yt-dlp channel error: ${err.message}`);
  }
}
