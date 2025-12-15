// utils/yt.js
import { spawn } from "child_process";
import path from "path";

const YTDLP = path.join(process.cwd(), "bin/yt-dlp");

function runYtDlp(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(YTDLP, args);
    let stdout = "", stderr = "";
    proc.stdout.on("data", d => stdout += d);
    proc.stderr.on("data", d => stderr += d);
    proc.on("close", code => {
      if (code !== 0) return reject(new Error(stderr));
      try { resolve(JSON.parse(stdout)); } 
      catch { reject(new Error("Invalid JSON")); }
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
    view_count: v.view_count
  };
}

export async function searchVideos(query) {
  const data = await runYtDlp(["-J", "--flat-playlist", `ytsearch10:${query}`]);
  return Array.isArray(data.entries) ? data.entries.map(normalizeVideo).filter(Boolean) : [];
}

export async function getVideoInfo(id) {
  const data = await runYtDlp(["-J", `https://www.youtube.com/watch?v=${id}`]);
  return {
    id: data.id,
    title: data.title,
    thumbnail: data.thumbnail,
    formats: data.formats
  };
}
