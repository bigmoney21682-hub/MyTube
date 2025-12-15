import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import {
  searchVideos,
  getTrending,
  getVideoInfo,
  getChannel,
  getRelated
} from "./utils/yt.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors({ origin: "*" }));
app.use(express.json());

/* ===================== ROUTES ===================== */

app.get("/search", async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) return res.json([]);
    res.json(await searchVideos(q));
  } catch (e) {
    res.status(500).json({ error: "search failed" });
  }
});

app.get("/trending", async (req, res) => {
  try {
    res.json(await getTrending());
  } catch {
    res.status(500).json([]);
  }
});

app.get("/video", async (req, res) => {
  try {
    res.json(await getVideoInfo(req.query.id));
  } catch {
    res.status(500).json({ error: "video failed" });
  }
});

app.get("/related", async (req, res) => {
  try {
    res.json(await getRelated(req.query.id));
  } catch {
    res.status(500).json([]);
  }
});

app.get("/channel/:id", async (req, res) => {
  try {
    res.json(await getChannel(req.params.id));
  } catch {
    res.status(500).json([]);
  }
});

/* ===================== START ===================== */

app.listen(PORT, () => {
  console.log(`MyTube backend running on ${PORT}`);
});
