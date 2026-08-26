import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { socketHandler } from "./socket/socketHandler.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173"
  })
);

app.use(express.json());

const server = http.createServer(app);

// 2. Optimized Socket.io connection settings (pingTimeout, pingInterval)
// This prevents random client disconnects by giving devices more time to respond.
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,   // Wait 60 seconds before closing an inactive connection
  pingInterval: 25000,  // Send a heartbeat ping every 25 seconds
});

// Initialize our socket event handlers
socketHandler(io);

app.get("/", (req, res) => {
  res.json({
    message: "SyncSpace backend is running"
  });
});

// Using Port 5001 to avoid macOS AirPlay conflict
const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`SyncSpace backend running on http://localhost:${PORT}`);
});

/* ==============================
   1. GRACEFUL SHUTDOWN LOGIC
   ============================== */
const gracefulShutdown = (signal) => {
  console.log(`\n[${signal}] signal received. Shutting down gracefully...`);
  
  // Stop accepting new HTTP connections
  server.close(() => {
    console.log('HTTP server closed.');
    
    // Disconnect all socket.io clients and close socket server
    io.close(() => {
      console.log('Socket.io connections safely closed.');
      process.exit(0);
    });
  });

  // Fallback timeout: Force shutdown if connections hang for more than 10 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down.');
    process.exit(1);
  }, 10000);
};

// Listen for termination signals (Ctrl+C, Docker stop, PM2 reload)
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught exceptions to prevent the process from instantly dying
process.on('uncaughtException', (error) => {
  console.error('[Uncaught Exception] Server error:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Unhandled Rejection] at:', promise, 'reason:', reason);
});