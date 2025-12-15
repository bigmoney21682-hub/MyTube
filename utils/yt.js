// Filename: utils/yt.js
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

// Resolve __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to cookies file
const COOKIES_PATH = path.join(__dirname, "cookies.txt");

// Path to yt-dlp binary (adjust if using Render bin folder)
const YTDLP =
  process.env.YTDLP_PATH ||
  "./bin/yt-dlp" ||
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
    "--cookies", COOKIES_PATH,
    "--js-runtimes", "node",
    `ytsearch20:${query}`
  ]);

  return Array.isArray(data.entries)
    ? data.entries.map(normalizeVideo).filter(Boolean)
    : [];
}

/**
 * TRENDING ✅
 * Uses stable YouTube playlist
 */
export async function getTrending() {
  try {
    const playlistId = "PLBCF2DAC6FFB574DE"; // YouTube trending playlist

    const data = await runYtDlp([
      "-J",
      "--flat-playlist",
      "--cookies", COOKIES_PATH,
      "--js-runtimes", "node",
      `https://www.youtube.com/playlist?list=${playlistId}`
    ]);

    return Array.isArray(data.entries)
      ? data.entries.map(normalizeVideo).filter(Boolean)
      : [];
  } catch (err) {
    console.error("Trending fetch error:", err.message);
    return [];
  }
}

/**
 * VIDEO DETAILS
 */
export async function getVideoInfo(id) {
  const data = await runYtDlp([
    "-J",
    "--cookies", COOKIES_PATH,
    "--js-runtimes", "node",
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
    "--cookies", COOKIES_PATH,
    "--js-runtimes", "node",
    `https://www.youtube.com/channel/${channelId}`
  ]);

  return Array.isArray(data.entries)
    ? data.entries.map(normalizeVideo).filter(Boolean)
    : [];
}

/**
 * RELATED VIDEOS
 */
export async function getRelated(id) {
  const data = await runYtDlp([
    "-J",
    "--flat-playlist",
    "--cookies", COOKIES_PATH,
    "--js-runtimes", "node",
    `ytrelated:${id}`
  ]);

  return Array.isArray(data.entries)
    ? data.entries.map(normalizeVideo).filter(Boolean)
    : [];
}
