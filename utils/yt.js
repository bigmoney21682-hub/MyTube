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

/* ===================== SAFARI COMPATIBILITY CHECK ===================== */
// Returns true if the video has at least one combined MP4 + H.264 (avc1) format
async function hasSafariCompatibleFormat(id) {
  try {
    const data = await runYtDlp([
      "-J",
      "--cookies", COOKIES_PATH,
      "--js-runtimes", "node",
      `https://www.youtube.com/watch?v=${id}`
    ]);

    if (!Array.isArray(data.formats)) return false;

    return data.formats.some(f =>
      f.url &&
      f.vcodec !== "none" &&
      f.acodec !== "none" &&          // combined stream (video + audio)
      f.ext === "mp4" &&
      f.vcodec && f.vcodec.startsWith("avc1")
    );
  } catch {
    return false;
  }
}

/* ===================== SEARCH ===================== */
export async function searchVideos(query) {
  const data = await runYtDlp([
    "-J",
    "--flat-playlist",
    "--cookies", COOKIES_PATH,
    "--js-runtimes", "node",
    `ytsearch20:${query}`
  ]);

  const entries = Array.isArray(data.entries) ? data.entries : [];

  const filtered = [];
  for (const entry of entries) {
    if (await hasSafariCompatibleFormat(entry.id)) {
      filtered.push(normalizeVideo(entry));
    }
  }

  return filtered;
}

/* ===================== TRENDING ===================== */
export async function getTrending() {
  const playlistId = "PLBCF2DAC6FFB574DE";

  const data = await runYtDlp([
    "-J",
    "--flat-playlist",
    "--cookies", COOKIES_PATH,
    "--js-runtimes", "node",
    `https://www.youtube.com/playlist?list=${playlistId}`
  ]);

  const entries = Array.isArray(data.entries) ? data.entries : [];

  const filtered = [];
  for (const entry of entries) {
    if (await hasSafariCompatibleFormat(entry.id)) {
      filtered.push(normalizeVideo(entry));
    }
  }

  return filtered;
}

/* ===================== VIDEO DETAILS ===================== */
export async function getVideoInfo(id) {
  const data = await runYtDlp([
    "-J",
    "--cookies", COOKIES_PATH,
    "--js-runtimes", "node",
    `https://www.youtube.com/watch?v=${id}`
  ]);

  // Filter to Safari-compatible formats (MP4 + H.264 + audio)
  const compatibleFormats = Array.isArray(data.formats)
    ? data.formats.filter(f =>
        f.url &&
        f.vcodec !== "none" &&
        f.acodec !== "none" &&
        f.ext === "mp4" &&
        f.vcodec && f.vcodec.startsWith("avc1")
      )
    : [];

  // If no compatible format, return null so frontend can skip
  if (compatibleFormats.length === 0) {
    return null;
  }

  // You can still include all formats if you want fallback options for other browsers
  const allFormats = data.formats || [];

  return {
    id: data.id,
    title: data.title,
    thumbnail: data.thumbnail,
    duration: data.duration,
    uploader: data.uploader,
    view_count: data.view_count,
    formats: compatibleFormats,        // only Safari-safe ones (recommended)
    // allFormats: allFormats,         // uncomment if you want all for non-Safari
  };
}

/* ===================== RELATED ===================== */
export async function getRelated(id) {
  const data = await runYtDlp([
    "-J",
    "--flat-playlist",
    "--cookies", COOKIES_PATH,
    "--js-runtimes", "node",
    `https://www.youtube.com/watch?v=${id}&list=RD${id}`
  ]);

  const entries = Array.isArray(data.entries) ? data.entries : [];

  const filtered = [];
  for (const entry of entries) {
    if (await hasSafariCompatibleFormat(entry.id)) {
      filtered.push(normalizeVideo(entry));
    }
  }

  return filtered;
}

/* ===================== CHANNEL ===================== */
export async function getChannel(channelId) {
  const data = await runYtDlp([
    "-J",
    "--flat-playlist",
    "--cookies", COOKIES_PATH,
    "--js-runtimes", "node",
    `https://www.youtube.com/channel/${channelId}`
  ]);

  const entries = Array.isArray(data.entries) ? data.entries : [];

  const filtered = [];
  for (const entry of entries) {
    if (await hasSafariCompatibleFormat(entry.id)) {
      filtered.push(normalizeVideo(entry));
    }
  }

  return filtered;
}
