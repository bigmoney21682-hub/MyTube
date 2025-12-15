import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const YTDLP =
  process.env.YTDLP_PATH ||
  process.env.YOUTUBE_DL_PATH ||
  "yt-dlp";

const COOKIES_PATH = path.join(__dirname, "cookies.txt");

function runYtDlp(args) {
  return new Promise((resolve, reject) => {
    const fullArgs = [...args, "--cookies", COOKIES_PATH, "--no-warnings"];
    const proc = spawn(YTDLP, fullArgs);

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (d) => (stdout += d));
    proc.stderr.on("data", (d) => (stderr += d));

    proc.on("close", (code) => {
      if (code !== 0) return reject(new Error(stderr || "yt-dlp failed"));
      try {
        resolve(JSON.parse(stdout));
      } catch {
        reject(new Error("Invalid JSON from yt-dlp"));
      }
    });
  });
}

function normalizeVideo(v) {
  if (!v || !v.id) return null;
  return {
    id: v.id,
    title: v.title,
    thumbnail: v.thumbnail || `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
    duration: v.duration,
    uploader: v.uploader,
    view_count: v.view_count,
  };
}

export async function searchVideos(query) {
  const data = await runYtDlp(["-J", "--flat-playlist", `ytsearch20:${query}`]);
  return data.entries?.map(normalizeVideo).filter(Boolean) || [];
}

export async function getTrending(region = "US") {
  const data = await runYtDlp([
    "-J",
    "--flat-playlist",
    `https://www.youtube.com/feed/trending?gl=${region}`,
  ]);
  return data.entries?.map(normalizeVideo).filter(Boolean) || [];
}

export async function getVideoInfo(id) {
  const data = await runYtDlp(["-J", `https://www.youtube.com/watch?v=${id}`]);
  return {
    id: data.id,
    title: data.title,
    thumbnail: data.thumbnail,
    duration: data.duration,
    uploader: data.uploader,
    view_count: data.view_count,
    formats: data.formats,
  };
}

export async function getChannel(channelId) {
  const data = await runYtDlp([
    "-J",
    "--flat-playlist",
    `https://www.youtube.com/channel/${channelId}`,
  ]);
  return data.entries?.map(normalizeVideo).filter(Boolean) || [];
}
