import ytdl from "youtube-dl-exec";

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

export async function getVideoInfo(videoId) {
  const url = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    const info = await ytdl(url, {
      dumpSingleJson: true,
      skipDownload: true,
      noWarnings: true,
      socketTimeout: 30000,
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
    console.error("[yt-dlp] video error", err);
    throw new Error(`yt-dlp error: ${err.message}`);
  }
}

/* … same for searchVideos, getTrending, getChannel without specifying paths … */
