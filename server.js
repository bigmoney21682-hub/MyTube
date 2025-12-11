import express from "express";
import cors from "cors";

import videoRoute from "./routes/video.js";
import searchRoute from "./routes/search.js";
import channelRoute from "./routes/channel.js";
import trendingRoute from "./routes/trending.js";

const app = express();
app.use(cors());

// API routes
app.use("/api/video", videoRoute);
app.use("/api/search", searchRoute);
app.use("/api/channel", channelRoute);
app.use("/api/trending", trendingRoute);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`MyTube backend running on port ${PORT}`);
});
