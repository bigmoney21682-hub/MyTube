import express from "express";
import cors from "cors";
import { execFile } from "node:child_process";
import util from "node:util";

const execFileAsync = util.promisify(execFile);

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_ORIGIN = [
  "https://bigmoney21682-hub.github.io",
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
);

// Helper to run yt-dlp and parse JSON
async function ytDlpJSON(args) {
  try {
    const { stdout } = await execFileAsync("./bin/yt-dlp", [
      "--dump-json",
      "--no-warnings",
      ...args,
    ]);
    return JSON.parse(stdout);
  } catch (err) {
    console.error("yt-dlp error:", err.message);
    throw err;
  }
}

// Search endpoint
app.get("/search", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "Missing query" });

  try {
    const data = await execFileAsync("./bin/yt-dlp", [
      `ytsearch10:${q}`,
      "--dump-json",
      "--no-warnings",
    ]);

    // Parse each line separately
    const results = data.stdout
      .split("\n")
      .filter(Boolean)
      .map(line => JSON.parse(line));

    res.json(results);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
});

// Video info endpoint
app.get("/video", async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "Missing video id" });

  try {
    const video = await ytDlpJSON([`https://www.youtube.com/watch?v=${id}`]);
    res.json(video);
  } catch (err) {
    res.status(500).json({ error: "Invalid video data" });
  }
});

// Related videos
app.get("/related", async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "Missing video id" });

  try {
    const related = await execFileAsync("./bin/yt-dlp", [
      `ytrelated:${id}`,
      "--dump-json",
      "--no-warnings",
    ]);

    const results = related.stdout
      .split("\n")
      .filter(Boolean)
      .map(line => JSON.parse(line));

    res.json(results);
  } catch (err) {
    console.error("Related error:", err);
    res.status(500).json({ error: "Failed to fetch related videos" });
  }
});

// Trending (example: top YouTube videos)
app.get("/trending", async (req, res) => {
  try {
    const trending = await execFileAsync("./bin/yt-dlp", [
      "https://www.youtube.com/feed/trending",
      "--dump-json",
      "--no-warnings",
    ]);

    const results = trending.stdout
      .split("\n")
      .filter(Boolean)
      .map(line => JSON.parse(line));

    res.json(results);
  } catch (err) {
    console.error("Trending error:", err);
    res.status(500).json({ error: "Failed to fetch trending" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
