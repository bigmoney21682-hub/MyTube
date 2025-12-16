import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

/* ===================== PATH SETUP ===================== */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const YTDLP = process.env.YTDLP_PATH || "./bin/yt-dlp";
const COOKIES_PATH = path.join(__dirname, "cookies.txt");

/* ===================== RUNNER ===================== */

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
  if (!v?.id) return null;

  return {
    id: v.id,
    title: v.title,
    thumbnail: v.thumbnail || `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
    duration: v.duration,
    uploader: v.uploader,
    view_count: v.view_count
  };
}

/* ===================== SEARCH ===================== */

export async function searchVideos(query) {
  if (!query) return [];

  const data = await runYtDlp([
    "-J",
    "--cookies", COOKIES_PATH,
    "--extractor-args", "youtube:player_client=android",
    "--user-agent",
    "Mozilla/5.0 (Linux; Android 10; Mobile)",
    `ytsearch20:${query}`
  ]);

  return Array.isArray(data.entries)
    ? data.entries.map(normalizeVideo).filter(Boolean)
    : [];
}

/* ===================== TRENDING ===================== */

export async function getTrending() {
  const data = await runYtDlp([
    "-J",
    "--cookies", COOKIES_PATH,
    "--extractor-args", "youtube:player_client=android",
    "--user-agent",
    "Mozilla/5.0 (Linux; Android 10; Mobile)",
    "https://www.youtube.com/playlist?list=PLFcGX84jKOu7fnNxRpajpvs-Zk3Za41ul"
  ]);

  return Array.isArray(data.entries)
    ? data.entries.map(normalizeVideo).filter(Boolean)
    : [];
}

/* ===================== VIDEO ===================== */

export async function getVideoInfo(id) {
  const data = await runYtDlp([
    "-J",
    "--cookies", COOKIES_PATH,
    "--extractor-args", "youtube:player_client=android",
    "--user-agent",
    "Mozilla/5.0 (Linux; Android 10; Mobile)",
    `https://www.youtube.com/watch?v=${id}`
  ]);

  if (!data?.formats) return null;

  return {
    id: data.id,
    title: data.title,
    thumbnail: data.thumbnail,
    duration: data.duration,
    uploader: data.uploader,
    view_count: data.view_count,
    formats: data.formats.filter(f =>
      f.url &&
      f.vcodec !== "none" &&
      f.ext === "mp4"
    )
  };
}

/* ===================== RELATED ===================== */

export async function getRelated(id) {
  const data = await runYtDlp([
    "-J",
    "--cookies", COOKIES_PATH,
    "--extractor-args", "youtube:player_client=android",
    "--user-agent",
    "Mozilla/5.0 (Linux; Android 10; Mobile)",
    `https://www.youtube.com/watch?v=${id}&list=RD${id}`
  ]);

  return Array.isArray(data.entries)
    ? data.entries.map(normalizeVideo).filter(Boolean)
    : [];
}
