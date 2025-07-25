import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import chatRoutes from "./routes/chat.js";
import authRoutes from "./routes/auth.js";
import Database from "./config/database.js";

// Load environment variables from .env file
const envResult = dotenv.config();

// Debug environment loading
if (envResult.error) {
  console.error("❌ Error loading .env file:", envResult.error.message);
  console.log(
    "📁 Make sure you have created backend/.env file with your DEEPSEEK_API_KEY and DATABASE_URL"
  );
} else {
  console.log("✅ Environment file loaded successfully");
}

// Debug API key and database URL presence (without showing the actual values)
if (process.env.DEEPSEEK_API_KEY) {
  console.log("✅ DEEPSEEK_API_KEY is configured");
} else {
  console.warn(
    "⚠️  WARNING: DEEPSEEK_API_KEY not found in environment variables"
  );
  console.log("📋 Please ensure your backend/.env file contains:");
  console.log("   DEEPSEEK_API_KEY=your_api_key_here");
}

if (process.env.DATABASE_URL) {
  console.log("✅ DATABASE_URL is configured");
} else {
  console.warn("⚠️  WARNING: DATABASE_URL not found in environment variables");
  console.log("📋 Please ensure your backend/.env file contains:");
  console.log("   DATABASE_URL=your_postgres_connection_string");
}

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: "Too many requests from this IP, please try again later.",
  },
});

app.use("/api/", limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "Chat Backend with Authentication",
    version: "2.0.0",
    features: ["DeepSeek AI", "User Authentication", "Persistent Chat History"],
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);
  res.status(500).json({
    success: false,
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : error.message,
  });
});

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  console.log(`\n📡 Received ${signal}. Starting graceful shutdown...`);

  try {
    await Database.close();
    console.log("✅ Database connections closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Start server
app.listen(PORT, () => {
  console.log("\n" + "=".repeat(60));
  console.log("🚀 DEEPSEEK CHAT BACKEND SERVER STARTED");
  console.log("=".repeat(60));
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth/*`);
  console.log(`💬 Chat endpoints: http://localhost:${PORT}/api/chat/*`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("=".repeat(60));
});
