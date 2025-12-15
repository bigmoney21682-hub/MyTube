// Filename: utils/yt.js
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

/* ===================== PATH SETUP ===================== */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cookies file (Netscape format)
const COOKIES_PATH = path.join(__dirname, "cookies.txt");

// yt-dlp binary (Render)
const YTDLP = process.env.YTDLP_PATH || "./bin/yt-dlp";

/* ===================== iOS SAFE FILTER ===================== */
/*
  This filter removes:
  - DASH-only videos
  - DRM
  - livestreams
  - formats iOS Safari cannot play
*/
const IOS_FILTER =
  "!is_live & " +
  "vcodec!=none & " +
  "(ext=mp4 | ext=webm)";

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

/* ===================== SEARCH ===================== */
export async function searchVideos(query) {
  const data = await runYtDlp([
    "-J",
    "--flat-playlist",
    "--match-filter", IOS_FILTER,
    "--cookies", COOKIES_PATH,
    "--js-runtimes", "node",
    `ytsearch20:${query}`
  ]);

  return Array.isArray(data.entries)
    ? data.entries.map(normalizeVideo).filter(Boolean)
    : [];
}

/* ===================== TRENDING ===================== */
export async function getTrending() {
  const playlistId = "PLBCF2DAC6FFB574DE"; // stable trending

  const data = await runYtDlp([
    "-J",
    "--flat-playlist",
    "--match-filter", IOS_FILTER,
    "--cookies", COOKIES_PATH,
    "--js-runtimes", "node",
    `https://www.youtube.com/playlist?list=${playlistId}`
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
    formats: Array.isArray(data.formats)
      ? data.formats.filter(f =>
          f.url &&
          f.vcodec !== "none" &&
          (f.ext === "mp4" || f.ext === "webm") &&
          !f.is_dash
        )
      : []
  };
}

/* ===================== RELATED (iOS SAFE) ===================== */
export async function getRelated(id) {
  const data = await runYtDlp([
    "-J",
    "--flat-playlist",
    "--match-filter", IOS_FILTER,
    "--cookies", COOKIES_PATH,
    "--js-runtimes", "node",
    `https://www.youtube.com/watch?v=${id}&list=RD${id}`
  ]);

  return Array.isArray(data.entries)
    ? data.entries.map(normalizeVideo).filter(Boolean)
    : [];
}

/* ===================== CHANNEL (FIXED EXPORT) ===================== */
export async function getChannel(channelId) {
  const data = await runYtDlp([
    "-J",
    "--flat-playlist",
    "--match-filter", IOS_FILTER,
    "--cookies", COOKIES_PATH,
    "--js-runtimes", "node",
    `https://www.youtube.com/channel/${channelId}`
  ]);

  return Array.isArray(data.entries)
    ? data.entries.map(normalizeVideo).filter(Boolean)
    : [];
}
