# Base image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y \
        python3 \
        python3-venv \
        python3-pip \
        ffmpeg \
        curl \
        git \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create a Python virtual environment
RUN python3 -m venv /opt/venv

# Upgrade pip inside the venv and install yt-dlp
RUN /opt/venv/bin/pip install --no-cache-dir --upgrade pip yt-dlp

# Add venv binaries to PATH
ENV PATH="/opt/venv/bin:$PATH"

# Copy package.json first for faster caching
COPY package*.json ./

# Install Node dependencies
RUN npm install --production

# Copy the rest of the backend code
COPY . .

# Expose port
EXPOSE 8080

# Environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Start backend
CMD ["node", "server.js"]
