# Base image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Install dependencies for yt-dlp
RUN apt-get update && \
    apt-get install -y \
        python3 \
        python3-pip \
        ffmpeg \
        curl \
        git \
        ca-certificates \
        && rm -rf /var/lib/apt/lists/*

# Install yt-dlp via pip
RUN pip3 install --no-cache-dir yt-dlp

# Copy package.json first for faster npm install caching
COPY package*.json ./

# Install Node dependencies
RUN npm install --production

# Copy the rest of the backend code
COPY . .

# Expose port (match server.js)
EXPOSE 8080

# Environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Start backend
CMD ["node", "server.js"]
