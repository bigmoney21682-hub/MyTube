import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);

const YTDLP = "yt-dlp";

async function runYtDlp(args) {
  const { stdout } = await exec(YTDLP, args, {
    maxBuffer: 1024 * 1024 * 50
  });
  return JSON.parse(stdout);
}

/* -------------------------
   VIDEO INFO
-------------------------- */
export async function getVideoInfo(id) {
  try {
    const data = await runYtDlp([
      `https://www.youtube.com/watch?v=${id}`,
      "-J",
      "--no-playlist"
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
  } catch (err) {
    throw new Error("yt-dlp error: " + err.message);
  }
}

/* -------------------------
   SEARCH
-------------------------- */
export async function searchVideos(query) {
  try {
    const data = await runYtDlp([
      `ytsearch20:${query}`,
      "-J",
      "--no-playlist"
    ]);

    if (!data.entries) return [];

    return data.entries
      .filter(v => v && v.id)
      .map(v => ({
        id: v.id,
        title: v.title,
        thumbnail: v.thumbnail,
        duration: v.duration,
        uploader: v.uploader,
        view_count: v.view_count
      }));
  } catch (err) {
    throw new Error("yt-dlp search error: " + err.message);
  }
}

/* -------------------------
   TRENDING (STABLE FALLBACK)
-------------------------- */
export async function getTrending() {
  try {
    // YouTube broke /feed/trending — this is the industry workaround
    const data = await runYtDlp([
      "ytsearch20:popular videos this week",
      "-J",
      "--no-playlist"
    ]);

    if (!data.entries) return [];

    return data.entries
      .filter(v => v && v.id)
      .map(v => ({
        id: v.id,
        title: v.title,
        thumbnail: v.thumbnail,
        duration: v.duration,
        uploader: v.uploader,
        view_count: v.view_count
      }));
  } catch (err) {
    throw new Error("yt-dlp trending error: " + err.message);
  }
}

/* -------------------------
   CHANNEL VIDEOS
-------------------------- */
export async function getChannel(channelUrl) {
  try {
    const data = await runYtDlp([
      channelUrl,
      "-J",
      "--no-playlist"
    ]);

    if (!data.entries) return [];

    return data.entries
      .filter(v => v && v.id)
      .map(v => ({
        id: v.id,
        title: v.title,
        thumbnail: v.thumbnail,
        duration: v.duration,
        uploader: v.uploader,
        view_count: v.view_count
      }));
  } catch (err) {
    throw new Error("yt-dlp channel error: " + err.message);
  }
}
