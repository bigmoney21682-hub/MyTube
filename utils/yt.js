// Filename: utils/yt.js
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

/* ===================== PATH SETUP ===================== */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COOKIES_PATH = path.join(__dirname, "cookies.txt");
const YTDLP = process.env.YTDLP_PATH || "./bin/yt-dlp";

/* ===================== CORE RUNNER ===================== */
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

/* ===================== NORMALIZER ===================== */
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

/* ===================== COMMON PLAYLIST ARGS ===================== */
const COMMON_ARGS = [
  "-J",
  "--flat-playlist",
  "--cookies", COOKIES_PATH,
];

/* ===================== SEARCH ===================== */
export async function searchVideos(query) {
  const data = await runYtDlp([
    ...COMMON_ARGS,
    `ytsearch20:${query}`
  ]);

  return Array.isArray(data.entries)
    ? data.entries.map(normalizeVideo).filter(Boolean)
    : [];
}

/* ===================== TRENDING ===================== */
// Note: The old playlist ID "PLBCF2DAC6FFB574DE" appears outdated (empty/slow in 2025).
// Switching to the current global Music Trending playlist for faster, relevant results.
// If you prefer non-music trending, we can explore alternatives later.
export async function getTrending() {
  const data = await runYtDlp([
    ...COMMON_ARGS,
    "https://www.youtube.com/playlist?list=PL4fGSI1pDJn6jXS_Tv_Fvv2fA5y0E9VY6"
  ]);

  return Array.isArray(data.entries)
    ? data.entries.map(normalizeVideo).filter(Boolean)
    : [];
}

/* ===================== VIDEO DETAILS ===================== */
export async function getVideoInfo(id) {
  const data = await runYtDlp([
    "-J",
    "--cookies", COOKIES_PATH,
    `https://www.youtube.com/watch?v=${id}`
  ]);

  // Prefer Safari-compatible combined MP4 + H.264 formats (fast direct URLs)
  const compatibleFormats = Array.isArray(data.formats)
    ? data.formats.filter(f =>
        f.url &&
        f.vcodec !== "none" &&
        f.acodec !== "none" &&
        f.ext === "mp4" &&
        f.vcodec && f.vcodec.startsWith("avc1")
      )
    : [];

  const formatsToUse = compatibleFormats.length > 0 ? compatibleFormats : (data.formats || []);

  return {
    id: data.id,
    title: data.title,
    thumbnail: data.thumbnail,
    duration: data.duration,
    uploader: data.uploader,
    view_count: data.view_count,
    formats: formatsToUse
  };
}

/* ===================== RELATED ===================== */
export async function getRelated(id) {
  const data = await runYtDlp([
    ...COMMON_ARGS,
    `https://www.youtube.com/watch?v=${id}&list=RD${id}`
  ]);

  return Array.isArray(data.entries)
    ? data.entries.map(normalizeVideo).filter(Boolean)
    : [];
}

/* ===================== CHANNEL ===================== */
export async function getChannel(channelId) {
  const data = await runYtDlp([
    ...COMMON_ARGS,
    `https://www.youtube.com/channel/${channelId}`
  ]);

  return Array.isArray(data.entries)
    ? data.entries.map(normalizeVideo).filter(Boolean)
    : [];
}
