import express from "express";
import "dotenv/config";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./configs/db.js";
import userRouter from "./routes/userRoutes.js";
import chatRouter from "./routes/chatRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import creditRouter from "./routes/creditRoutes.js";
import { stripeWebhooks } from "./controllers/webhooks.js";

const app = express();
await connectDB();

// ─────────────────────────────
// 1. Stripe webhook (raw body)
// ─────────────────────────────
app.post(
  "/api/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhooks
);

// ─────────────────────────────
// 2. Normal middleware
// ─────────────────────────────
app.use(cors());
app.use(express.json());

// Simple health check for API
app.get('/api', (req, res) => {
  res.json({ ok: true, service: 'backend', version: '1.0', time: new Date().toISOString() });
});

// ─────────────────────────────
// 3. API routes
// ─────────────────────────────
try {
  app.get("/api", (req, res) => res.send("Api Server is Live!"));
  app.use("/api/user", userRouter);
  app.use("/api/chat", chatRouter);
  app.use("/api/message", messageRouter);
  app.use("/api/credit", creditRouter);
  
} catch (error) {
  console.error("Route load error:", error);
}

// ─────────────────────────────
// 4. Serve React build *after* API routes
// ─────────────────────────────
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientBuildPath = path.join(__dirname, "../client/dist");
app.use(express.static(clientBuildPath));

// Regex catch-all avoids Express 5 “path-to-regexp” bug
// Catch-all *only* for non-API requests
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

// ─────────────────────────────
// 5. Start server
// ─────────────────────────────
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});
