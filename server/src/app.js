import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { connectDB } from './config/db.js';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

const app = express();

// Initialize DB connection immediately
connectDB();

// Universal CORS configuration supporting mobile browsers & Vercel
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);
app.options('*', cors());

// Ensure DB is connected before processing requests (crucial for serverless)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection error:', err);
    next();
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files (avatars & post media)
app.use('/uploads', express.static(path.resolve('uploads')));

// Mount API routes (dual-mount with and without /api for seamless Vercel rewrites)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/messages', messageRoutes);

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/posts', postRoutes);
app.use('/messages', messageRoutes);

// Health check routes
app.get(['/', '/api'], (req, res) => {
  res.json({
    success: true,
    message: 'Social App API is running flawlessly! 🚀',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      posts: '/api/posts',
      messages: '/api/messages'
    }
  });
});

// Serve frontend static build in production if present (Unified Deployment)
const clientDistPath = path.resolve('../client/dist');
const localDistPath = path.resolve('client/dist');
const distPath = fs.existsSync(clientDistPath) ? clientDistPath : fs.existsSync(localDistPath) ? localDistPath : null;

if (distPath) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'Social App API Server is active! 🚀 Connect frontend client via VITE_API_URL.'
    });
  });
}

// 404 Route Handler for unmatched API routes
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: `API route not found: ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

export default app;