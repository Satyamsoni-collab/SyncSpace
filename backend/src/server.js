import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { socketHandler } from './socket/socketHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Configure CORS for Express
app.use(cors({
  origin: '*', // Allow all origins for now, update for production
}));

// Configure Socket.io with CORS allowing all origins
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Initialize socket handlers
socketHandler(io);

// Basic health check route
app.get('/', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'SyncSpace server is running.' });
});

const PORT = process.env.PORT || 5001;

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
