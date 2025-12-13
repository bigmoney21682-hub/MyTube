import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import YTDlpWrap from 'yt-dlp-wrap';

const app = express();
const port = process.env.PORT || 3000;

// Global middleware
app.use(cors());
app.use(express.json());

// Ensure yt-dlp binary is downloaded (fallback if postinstall fails)
async function ensureYtDlpBinary() {
  const binaryPath = path.join(process.cwd(), 'yt-dlp');  // Default path from wrapper
  try {
    await fs.access(binaryPath);
  } catch {
    console.log('Downloading yt-dlp binary...');
    await YTDlpWrap.downloadFromGithub(binaryPath);
  }
}
ensureYtDlpBinary().catch(err => console.error('Binary download failed:', err));

// Mount routes
import videoRouter from './routes/video.js';
import searchRouter from './routes/search.js';
import trendingRouter from './routes/trending.js';
import channelRouter from './routes/channel.js';

app.use('/video', videoRouter);
app.use('/search', searchRouter);
app.use('/trending', trendingRouter);
app.use('/channel', channelRouter);

// Health check
app.get('/', (req, res) => res.send('MyTube Backend is running!'));

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
