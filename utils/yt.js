import ytdl from "youtube-dl-exec";

/* Render-provided binary */
const YTDLP_PATH = process.env.YTDLP_PATH || "yt-dlp";

/* -------------------- Helpers -------------------- */
function extractFormats(formats) {
  if (!Array.isArray(formats)) return [];

  return formats
    .filter(f => f.url && f.protocol?.startsWith("http"))
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

/* -------------------- Video -------------------- */
export async function getVideoInfo(videoId) {
  const url = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    const info = await ytdl(url, {
      dumpSingleJson: true,
      skipDownload: true,
      noWarnings: true,
      socketTimeout: 30000,
      binaryPath: YTDLP_PATH,
    });

    return {
      id: info.id,
      title: info.title,
      thumbnail: info.thumbnail,
      duration: info.duration,
      uploader: info.uploader,
      view_count: info.view_count,
      formats: extractFormats(info.formats),
      best_url: info.url || null,
    };
  } catch (err) {
    console.error(`[yt-dlp] video failed (${videoId})`, err);
    throw new Error(`yt-dlp error: ${err.message}`);
  }
}

/* -------------------- Search -------------------- */
export async function searchVideos(query, limit = 10) {
  const searchUrl = `ytsearch${limit}:${query}`;

  try {
    const info = await ytdl(searchUrl, {
      dumpSingleJson: true,
      skipDownload: true,
      noWarnings: true,
      socketTimeout: 30000,
      binaryPath: YTDLP_PATH,
    });

    return (info.entries || []).map(video => ({
      id: video.id,
      title: video.title,
      thumbnail: video.thumbnail,
      duration: video.duration,
      uploader: video.uploader,
      view_count: video.view_count,
      formats: extractFormats(video.formats),
      best_url: video.url || null,
    }));
  } catch (err) {
    console.error(`[yt-dlp] search failed (${query})`, err);
    throw new Error(`yt-dlp search error: ${err.message}`);
  }
}

/* -------------------- Trending -------------------- */
export async function getTrending(limit = 20) {
  try {
    const info = await ytdl("https://www.youtube.com/feed/trending", {
      dumpSingleJson: true,
      skipDownload: true,
      noWarnings: true,
      socketTimeout: 30000,
      binaryPath: YTDLP_PATH,
    });

    return (info.entries || [])
      .slice(0, limit)
      .map(video => ({
        id: video.id,
        title: video.title,
        thumbnail: video.thumbnail,
        duration: video.duration,
        uploader: video.uploader,
        view_count: video.view_count,
        formats: extractFormats(video.formats),
        best_url: video.url || null,
      }));
  } catch (err) {
    console.error("[yt-dlp] trending failed", err);
    throw new Error(`yt-dlp trending error: ${err.message}`);
  }
}

/* -------------------- Channel -------------------- */
export async function getChannel(channelId, limit = 20) {
  const channelUrl = `https://www.youtube.com/channel/${channelId}`;

  try {
    const info = await ytdl(channelUrl, {
      dumpSingleJson: true,
      skipDownload: true,
      noWarnings: true,
      socketTimeout: 30000,
      binaryPath: YTDLP_PATH,
    });

    return (info.entries || [])
      .slice(0, limit)
      .map(video => ({
        id: video.id,
        title: video.title,
        thumbnail: video.thumbnail,
        duration: video.duration,
        uploader: info.uploader,
        view_count: video.view_count,
        formats: extractFormats(video.formats),
        best_url: video.url || null,
      }));
  } catch (err) {
    console.error(`[yt-dlp] channel failed (${channelId})`, err);
    throw new Error(`yt-dlp channel error: ${err.message}`);
  }
}
