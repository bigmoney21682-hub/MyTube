import express from "express";
import cors from "cors";
import { exec } from "child_process";
import path from "path";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 3000;

// --- CORS Setup ---
app.use(cors({
    origin: "*", // Can restrict to your frontend domain later
    methods: ["GET"]
}));

// --- Helper function to call yt-dlp ---
function runYtdlp(url, callback) {
    const cookiesPath = path.resolve("./bin/cookies.txt");

    // Use cookies if available
    const cookiesOption = fs.existsSync(cookiesPath) ? `--cookies ${cookiesPath}` : "";
    const cmd = `./bin/yt-dlp ${url} --dump-json --no-warnings ${cookiesOption}`;

    exec(cmd, (err, stdout, stderr) => {
        if (err) return callback(stderr || err.message);
        try {
            const lines = stdout.split("\n").filter(Boolean);
            const data = lines.map(line => JSON.parse(line));
            callback(null, data);
        } catch (parseErr) {
            callback(parseErr.message);
        }
    });
}

// --- Video endpoint ---
app.get("/video", (req, res) => {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Missing video id" });

    runYtdlp(`https://www.youtube.com/watch?v=${id}`, (err, data) => {
        if (err) return res.status(500).json({ error: "Invalid video data", details: err });
        res.json(data[0]); // single video
    });
});

// --- Search endpoint ---
app.get("/search", (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: "Missing query" });

    runYtdlp(`ytsearch50:${q}`, (err, data) => {
        if (err) return res.status(500).json({ error: "Search failed", details: err });
        res.json(data);
    });
});

// --- Trending endpoint ---
app.get("/trending", (req, res) => {
    // Can switch to subscriptions later
    runYtdlp(`https://www.youtube.com/feed/trending`, (err, data) => {
        if (err) return res.status(500).json({ error: "Failed to fetch trending", details: err });
        res.json(data);
    });
});

// --- Related videos endpoint ---
app.get("/related", (req, res) => {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Missing video id" });

    runYtdlp(`https://www.youtube.com/watch?v=${id} --get-comments`, (err, data) => {
        if (err) return res.status(500).json({ error: "Failed to fetch related videos", details: err });
        res.json(data);
    });
});

// --- Start server ---
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
