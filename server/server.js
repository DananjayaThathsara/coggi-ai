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

// Stripe Webhook must come before express.json()
app.post(
  "/api/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhooks
);

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
try {
   app.get("/", (req, res) => res.send("Server is Live!"));
   app.use("/api/user", userRouter);
   app.use("/api/chat", chatRouter);
   app.use("/api/message", messageRouter);
   app.use("/api/credit", creditRouter); 
   console.log('all routes loaded')
} catch (error) {
    console.log("route load error", error);
}


const PORT = process.env.PORT || 3000;

// Serve frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientBuildPath = path.join(__dirname, "../client/dist");
app.use(express.static(clientBuildPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});
