import { spawn } from "child_process";

const YTDLP =
  process.env.YTDLP_PATH ||
  process.env.YOUTUBE_DL_PATH ||
  "yt-dlp";

/**
 * Run yt-dlp and return parsed JSON
 */
function runYtDlp(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(YTDLP, args);

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", d => (stdout += d));
    proc.stderr.on("data", d => (stderr += d));

    proc.on("close", code => {
      if (code !== 0) {
        return reject(new Error(stderr || "yt-dlp failed"));
      }
      try {
        resolve(JSON.parse(stdout));
      } catch {
        reject(new Error("Invalid JSON from yt-dlp"));
      }
    });
  });
}

/**
 * Normalize a yt-dlp video entry
 */
function normalizeVideo(v) {
  if (!v || !v.id) return null;

  return {
    id: v.id,
    title: v.title,
    thumbnail:
      v.thumbnail ||
      `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
    duration: v.duration,
    uploader: v.uploader,
    view_count: v.view_count
  };
}

/**
 * SEARCH
 */
export async function searchVideos(query) {
  const data = await runYtDlp([
    "-J",
    "--flat-playlist",
    `ytsearch20:${query}`
  ]);

  return Array.isArray(data.entries)
    ? data.entries.map(normalizeVideo).filter(Boolean)
    : [];
}

/**
 * TRENDING ✅
 * Uses a stable YouTube playlist to avoid search/trending errors
 */
export async function getTrending() {
  try {
    const playlistId = "PLBCF2DAC6FFB574DE"; // YouTube trending playlist

    const data = await runYtDlp([
      "-J",
      "--flat-playlist",
      `https://www.youtube.com/playlist?list=${playlistId}`
    ]);

    return Array.isArray(data.entries)
      ? data.entries.map(normalizeVideo).filter(Boolean)
      : [];
  } catch (err) {
    console.error("Trending fetch error:", err.message);
    return []; // Return empty array so frontend map() works
  }
}

/**
 * VIDEO DETAILS
 */
export async function getVideoInfo(id) {
  const data = await runYtDlp([
    "-J",
    `https://www.youtube.com/watch?v=${id}`
  ]);

  return {
    id: data.id,
    title: data.title,
    thumbnail: data.thumbnail,
    duration: data.duration,
    uploader: data.uploader,
    view_count: data.view_count,
    formats: data.formats
  };
}

/**
 * CHANNEL
 */
export async function getChannel(channelId) {
  const data = await runYtDlp([
    "-J",
    "--flat-playlist",
    `https://www.youtube.com/channel/${channelId}`
  ]);

  return Array.isArray(data.entries)
    ? data.entries.map(normalizeVideo).filter(Boolean)
    : [];
}
