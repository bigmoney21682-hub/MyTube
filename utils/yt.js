import { spawn } from "child_process";
import path from "path";

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
      } catch (e) {
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

  return (
    data.entries
      ?.map(normalizeVideo)
      .filter(Boolean) || []
  );
}

/**
 * TRENDING (fallback-based)
 */
export async function getTrendingVideos() {
  const data = await runYtDlp([
    "-J",
    "--flat-playlist",
    "ytsearch20:trending videos"
  ]);

  return (
    data.entries
      ?.map(normalizeVideo)
      .filter(Boolean) || []
  );
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
