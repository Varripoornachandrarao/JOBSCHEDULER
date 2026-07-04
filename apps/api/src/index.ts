import dotenv from 'dotenv';
import path from 'path';
// Load environment variables before any other imports
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

import http from 'http';
import { Server } from 'socket.io';
import { app } from './app';
import { config } from './config';
import { redisConnection } from './config/redis';

const server = http.createServer(app);

// Initialize Socket.io server
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`Client socket connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`Client socket disconnected: ${socket.id}`);
  });
});

// Start listening
server.listen(config.port, () => {
  console.log(`[API] Server listening at http://localhost:${config.port}`);
});

// Handle graceful termination
process.on('SIGTERM', () => {
  console.log('[API] SIGTERM received. Shutting down...');
  server.close(() => {
    redisConnection.disconnect();
    console.log('[API] Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('[API] SIGINT received. Shutting down...');
  server.close(() => {
    redisConnection.disconnect();
    console.log('[API] Server closed.');
    process.exit(0);
  });
});
