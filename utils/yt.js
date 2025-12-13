import YTDlpWrap from 'yt-dlp-wrap';
import path from 'path';

const binaryPath = path.join(process.cwd(), 'yt-dlp');
const ytDlpWrap = new YTDlpWrap(binaryPath);

// Helper to extract formats with direct URLs (ad-free)
function extractFormats(info) {
  return info.formats
    .filter(f => f.url && f.protocol.startsWith('http'))
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

// Get video info and streams
export async function getVideoInfo(videoId) {
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  try {
    const metadata = await ytDlpWrap.getVideoInfo(url);
    const formats = extractFormats(metadata);
    const bestUrl = metadata.url || formats[0]?.url || null;

    return {
      id: metadata.id,
      title: metadata.title,
      thumbnail: metadata.thumbnail,
      duration: metadata.duration,
      uploader: metadata.uploader,
      view_count: metadata.view_count,
      formats,
      best_url: bestUrl,  // Direct ad-free URL for player
    };
  } catch (error) {
    throw new Error(`Video extraction failed: ${error.message}`);
  }
}

// Search videos
export async function searchVideos(query, limit = 10) {
  try {
    const results = await ytDlpWrap.execPromise([`ytsearch${limit}:${query}`, '-j', '--flat-playlist']);
    const jsonResults = results.split('\n').filter(Boolean).map(JSON.parse);
    return jsonResults.map(item => ({
      id: item.id,
      title: item.title,
      thumbnail: item.thumbnail,
      uploader: item.uploader,
      duration: item.duration,
    }));
  } catch (error) {
    throw new Error(`Search failed: ${error.message}`);
  }
}

// Get trending videos
export async function getTrending(limit = 20) {
  const url = 'https://www.youtube.com/feed/trending';
  try {
    const results = await ytDlpWrap.execPromise([url, '-j', '--flat-playlist']);
    const jsonResults = results.split('\n').filter(Boolean).map(JSON.parse).slice(0, limit);
    return jsonResults.map(item => ({
      id: item.id,
      title: item.title,
      thumbnail: item.thumbnail,
      uploader: item.uploader,
      view_count: item.view_count,
    }));
  } catch (error) {
    throw new Error(`Trending extraction failed: ${error.message}`);
  }
}

// Get channel videos/playlist
export async function getChannel(channelIdOrHandle, limit = 20) {
  const url = channelIdOrHandle.startsWith('@') ? `https://www.youtube.com/${channelIdOrHandle}` : `https://www.youtube.com/channel/${channelIdOrHandle}`;
  try {
    const results = await ytDlpWrap.execPromise([url, '-j', '--flat-playlist']);
    const jsonResults = results.split('\n').filter(Boolean).map(JSON.parse).slice(0, limit);
    return {
      channel_title: jsonResults[0]?.playlist_title || 'Unknown',
      videos: jsonResults.map(item => ({
        id: item.id,
        title: item.title,
        thumbnail: item.thumbnail,
        duration: item.duration,
      })),
    };
  } catch (error) {
    throw new Error(`Channel extraction failed: ${error.message}`);
  }
}
