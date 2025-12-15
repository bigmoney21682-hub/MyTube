import express from "express";
import cors from "cors";
import { exec } from "child_process";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Allow cross-origin requests

const YTDLP = path.resolve("./bin/yt-dlp");

// --- SEARCH ---
app.get("/search", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "Missing query parameter" });

  try {
    const cmd = `${YTDLP} "ytsearch20:${q}" --dump-json --no-warnings`;
    exec(cmd, { maxBuffer: 1024 * 1024 * 10 }, (err, stdout, stderr) => {
      if (err) {
        console.error("Search error:", stderr);
        return res.status(500).json({ error: stderr });
      }
      const videos = stdout
        .split(/\r?\n(?=\{)/)
        .filter(Boolean)
        .map(line => JSON.parse(line));
      res.json(videos);
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Search failed" });
  }
});

// --- VIDEO ---
app.get("/video", async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "Missing video id" });

  try {
    const cmd = `${YTDLP} -j https://www.youtube.com/watch?v=${id} --no-warnings`;
    exec(cmd, { maxBuffer: 1024 * 1024 * 10 }, (err, stdout, stderr) => {
      if (err) {
        console.error("Video fetch error:", stderr);
        return res.status(500).json({ error: stderr });
      }
      const video = JSON.parse(stdout);
      res.json(video);
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch video" });
  }
});

// --- RELATED ---
app.get("/related", async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "Missing video id" });

  try {
    const cmd = `${YTDLP} "ytsearch10:related to ${id}" --dump-json --no-warnings`;
    exec(cmd, { maxBuffer: 1024 * 1024 * 10 }, (err, stdout, stderr) => {
      if (err) {
        console.error("Related error:", stderr);
        return res.status(500).json({ error: stderr });
      }
      const videos = stdout
        .split(/\r?\n(?=\{)/)
        .filter(Boolean)
        .map(line => JSON.parse(line));
      res.json(videos);
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch related videos" });
  }
});

// --- TRENDING ---
app.get("/trending", async (req, res) => {
  try {
    const cmd = `${YTDLP} "ytsearch50:trending videos" --dump-json --no-warnings`;
    exec(cmd, { maxBuffer: 1024 * 1024 * 20 }, (err, stdout, stderr) => {
      if (err) {
        console.error("Trending error:", stderr);
        return res.status(500).json({ error: stderr });
      }
      const videos = stdout
        .split(/\r?\n(?=\{)/)
        .filter(Boolean)
        .map(line => JSON.parse(line));
      res.json(videos);
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch trending videos" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
