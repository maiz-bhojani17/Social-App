import dns from 'node:dns';
try {
  dns.setDefaultResultOrder('ipv4first');
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // DNS fallback
}

import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { Server } from 'socket.io';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env reliably regardless of execution working directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config(); // fallback

import app from './app.js';
import { connectDB } from './config/db.js';
import { initSocket } from './sockets/chatSocket.js';

// Global error handlers to prevent abrupt process termination
process.on('uncaughtException', (err) => {
  console.error('\n💥 UNCAUGHT EXCEPTION:', err.name, err.message);
  console.error(err.stack);
});

process.on('unhandledRejection', (reason) => {
  console.error('\n💥 UNHANDLED REJECTION:', reason);
});

// Connect to MongoDB
connectDB();

const server = http.createServer(app);

const socketOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.includes(',')
    ? process.env.CLIENT_URL.split(',').map((u) => u.trim())
    : process.env.CLIENT_URL
  : '*';

// Socket.io for Real-time Chat (Item 19)
const io = new Server(server, {
  cors: {
    origin: socketOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Initialize socket handlers
initSocket(io);

let PORT = Number(process.env.PORT) || 5000;

// Catch EADDRINUSE error if port is already taken by a background process
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`\n⚠️ Port ${PORT} is currently busy or occupied by another process.`);
    console.warn(`💡 Switching to port ${PORT + 1} automatically to keep server running...\n`);
    PORT = PORT + 1;
    setTimeout(() => {
      server.listen(PORT, () => {
        console.log(`🚀 Server successfully started on port ${PORT}`);
        console.log(`📡 Real-time Socket.io active on port ${PORT}`);
      });
    }, 500);
  } else {
    console.error('Server error:', err);
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Real-time Socket.io active on port ${PORT}`);
});