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
  // Use the last argument (URL or search query) as a readable label
  const label = args[args.length - 1] || "unknown";
  const shortLabel = label.length > 60 ? label.slice(0, 57) + "..." : label;

  console.time(`yt-dlp → ${shortLabel}`);

  return new Promise((resolve, reject) => {
    const proc = spawn(YTDLP, args);

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", d => (stdout += d));
    proc.stderr.on("data", d => (stderr += d));

    proc.on("close", code => {
      console.timeEnd(`yt-dlp → ${shortLabel}`);

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
  console.time(`searchVideos: "${query}"`);

  const data = await runYtDlp([
    ...COMMON_ARGS,
    `ytsearch20:${query}`
  ]);

  console.timeEnd(`searchVideos: "${query}"`);

  return Array.isArray(data.entries)
    ? data.entries.map(normalizeVideo).filter(Boolean)
    : [];
}

/* ===================== TRENDING ===================== */
export async function getTrending() {
  console.time("getTrending");

  const data = await runYtDlp([
    ...COMMON_ARGS,
    "https://www.youtube.com/playlist?list=PL4fGSI1pDJn6jXS_Tv_Fvv2fA5y0E9VY6"
  ]);

  console.timeEnd("getTrending");

  return Array.isArray(data.entries)
    ? data.entries.map(normalizeVideo).filter(Boolean)
    : [];
}

/* ===================== VIDEO DETAILS ===================== */
export async function getVideoInfo(id) {
  console.time(`getVideoInfo: ${id}`);

  const data = await runYtDlp([
    "-J",
    "--cookies", COOKIES_PATH,
    `https://www.youtube.com/watch?v=${id}`
  ]);

  // Check for Safari-compatible format
  const hasCompatibleFormat = Array.isArray(data.formats)
    ? data.formats.some(f =>
        f.url &&
        f.vcodec !== "none" &&
        f.acodec !== "none" &&
        f.ext === "mp4" &&
        f.vcodec && f.vcodec.startsWith("avc1")
      )
    : false;

  const isSafariPlayable = hasCompatibleFormat;

  const compatibleFormats = hasCompatibleFormat
    ? data.formats.filter(f =>
        f.url &&
        f.vcodec !== "none" &&
        f.acodec !== "none" &&
        f.ext === "mp4" &&
        f.vcodec && f.vcodec.startsWith("avc1")
      )
    : [];

  const formatsToUse = compatibleFormats.length > 0 ? compatibleFormats : (data.formats || []);

  console.timeEnd(`getVideoInfo: ${id}`);

  return {
    id: data.id,
    title: data.title,
    thumbnail: data.thumbnail,
    duration: data.duration,
    uploader: data.uploader,
    view_count: data.view_count,
    formats: formatsToUse,
    isSafariPlayable
  };
}

/* ===================== RELATED ===================== */
export async function getRelated(id) {
  console.time(`getRelated: ${id}`);

  const data = await runYtDlp([
    ...COMMON_ARGS,
    `https://www.youtube.com/watch?v=${id}&list=RD${id}`
  ]);

  console.timeEnd(`getRelated: ${id}`);

  return Array.isArray(data.entries)
    ? data.entries.map(normalizeVideo).filter(Boolean)
    : [];
}

/* ===================== CHANNEL ===================== */
export async function getChannel(channelId) {
  console.time(`getChannel: ${channelId}`);

  const data = await runYtDlp([
    ...COMMON_ARGS,
    `https://www.youtube.com/channel/${channelId}`
  ]);

  console.timeEnd(`getChannel: ${channelId}`);

  return Array.isArray(data.entries)
    ? data.entries.map(normalizeVideo).filter(Boolean)
    : [];
}
