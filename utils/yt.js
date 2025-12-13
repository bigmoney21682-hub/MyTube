import ytdl from 'youtube-dl-exec';

// Helper to extract clean formats
function extractFormats(formats) {
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

// Get video info and direct streams (ad-free)
export async function getVideoInfo(videoId) {
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  const info = await ytdl(url, {
    dumpSingleJson: true,
    noWarnings: true,
    skipDownload: true,
    // Optional: add user-agent if needed later
    // addHeader: ['User-Agent: Mozilla/5.0']
  });

  const formats = extractFormats(info.formats);
  const bestUrl = info.url || formats[0]?.url || null;

  return {
    id: info.id,
    title: info.title,
    thumbnail: info.thumbnail,
    duration: info.duration,
    uploader: info.uploader,
    view_count: info.view_count,
    formats,
    best_url: bestUrl,
  };
}

// Search
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

// Trending
export async function getTrending(limit = 20) {
  const info = await ytdl('https://www.youtube.com/feed/trending', {
    dumpSingleJson: true,
    flatPlaylist: true,
  });

  return info.entries.slice(0, limit).map(item => ({
    id: item.id,
    title: item.title,
    thumbnail: item.thumbnail,
    uploader: item.uploader,
    view_count: item.view_count,
  }));
}

// Channel
export async function getChannel(channelIdOrHandle, limit = 20) {
  let url = channelIdOrHandle.startsWith('@')
    ? `https://www.youtube.com/${channelIdOrHandle}/videos`
    : `https://www.youtube.com/channel/${channelIdOrHandle}/videos`;

  const info = await ytdl(url, {
    dumpSingleJson: true,
    flatPlaylist: true,
  });

  return {
    channel_title: info.title || 'Unknown',
    videos: info.entries.slice(0, limit).map(item => ({
      id: item.id,
      title: item.title,
      thumbnail: item.thumbnail,
      duration: item.duration,
    })),
  };
}
