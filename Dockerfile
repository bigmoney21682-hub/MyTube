# --- Base image ---
FROM node:20-slim

# --- Set working directory ---
WORKDIR /app

# --- Install dependencies ---
COPY package*.json ./
RUN npm install --production

# --- Install yt-dlp ---
RUN apt-get update && \
    apt-get install -y python3 python3-pip ffmpeg && \
    pip3 install --no-cache-dir yt-dlp && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# --- Copy backend source code ---
COPY . .

# --- Expose port (match server.js) ---
EXPOSE 8080

# --- Set environment variables (optional defaults) ---
ENV NODE_ENV=production
ENV PORT=8080

# --- Start backend ---
CMD ["node", "server.js"]
