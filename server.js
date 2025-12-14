import express from "express";
import cors from "cors";

import videoRouter from "./routes/video.js";
import searchRouter from "./routes/search.js";
import trendingRouter from "./routes/trending.js";
import channelRouter from "./routes/channel.js";

const app = express();
const port = process.env.PORT || 3000;

/* -------------------- CORS (explicit, browser-safe) -------------------- */
app.use(
  cors({
    origin: "*", // allow direct browser testing for now
    methods: ["GET"],
    allowedHeaders: ["Content-Type"],
  })
);

/* -------------------- Middleware -------------------- */
app.use(express.json());

/* Simple request logger (CRITICAL for sanity checks) */
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.originalUrl}`);
  next();
});

/* -------------------- Routes -------------------- */
app.use("/video", videoRouter);
app.use("/search", searchRouter);
app.use("/trending", trendingRouter);
app.use("/channel", channelRouter);

/* -------------------- Health check -------------------- */
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "MyTube Backend",
    timestamp: new Date().toISOString(),
  });
});

/* -------------------- Error handler -------------------- */
app.use((err, req, res, next) => {
  console.error("[ERROR]", err);
  res.status(500).json({ error: "Internal server error" });
});

/* -------------------- Start server -------------------- */
app.listen(port, () => {
  console.log(`🚀 MyTube backend listening on port ${port}`);
});
