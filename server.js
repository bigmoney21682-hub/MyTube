import express from 'express';
import cors from 'cors';
import videoRouter from './routes/video.js';
import searchRouter from './routes/search.js';
import trendingRouter from './routes/trending.js';
import channelRouter from './routes/channel.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Mount routes
app.use('/video', videoRouter);
app.use('/search', searchRouter);
app.use('/trending', trendingRouter);
app.use('/channel', channelRouter);

// Health check
app.get('/', (req, res) => res.send('MyTube Backend is running!'));

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
