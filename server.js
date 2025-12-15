import express from "express";
import cors from "cors";
import { spawn } from "child_process";

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ ALLOWED ORIGINS
const allowedOrigins = [
  "https://bigmoney21682-hub.github.io",
  "http://localhost:5173",
  "http://localhost:3000"
];

// ✅ CORS CONFIG (RENDER-SAFE)
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow non-browser requests (curl, server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("CORS not allowed"));
      }
    },
    methods: ["GET"],
    allowedHeaders: ["Content-Type"],
    credentials: false
  })
);

app.use(express.json());
