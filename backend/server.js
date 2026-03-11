import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

// Import utilities and middleware
import { initializeStorage } from './utils/storage.js';
import { errorHandler } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import chatRoutes, { setupChatSocket } from './routes/chat.js';
import ratingRoutes from './routes/ratings.js';
import aiRoutes from './routes/ai.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'FixItNow API is running',
        timestamp: new Date().toISOString()
    });
});

// Setup Socket.io for chat
setupChatSocket(io);

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize storage and start server
async function startServer() {
    try {
        await initializeStorage();

        httpServer.listen(PORT, () => {
            console.log(`
╔═══════════════════════════════════════╗
║     FixItNow Backend Server           ║
║                                       ║
║  Server running on port ${PORT}         ║
║  http://localhost:${PORT}                ║
║                                       ║
║  API Endpoints:                       ║
║  - Auth:    /api/auth                 ║
║  - Jobs:    /api/jobs                 ║
║  - Chat:    /api/chat                 ║
║  - Ratings: /api/ratings              ║
║  - AI:      /api/ai                   ║
║                                       ║
║  Socket.io: Connected                 ║
╚═══════════════════════════════════════╝
      `);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
