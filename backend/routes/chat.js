import express from 'express';
import { readJSON, writeJSON } from '../utils/storage.js';
import { ApiError } from '../middleware/errorHandler.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

/**
 * GET /api/chat/:jobId
 * Get chat history for a job
 */
router.get('/:jobId', async (req, res, next) => {
    try {
        const { jobId } = req.params;

        const chats = await readJSON('chats.json');
        const messages = chats[jobId] || [];

        res.json({
            success: true,
            messages
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/chat/:jobId
 * Send a message in job chat
 */
router.post('/:jobId', async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const { senderId, senderName, message } = req.body;

        if (!senderId || !senderName || !message) {
            throw new ApiError('Missing required fields', 400);
        }

        const newMessage = {
            id: uuidv4(),
            senderId,
            senderName,
            message,
            timestamp: new Date().toISOString()
        };

        const chats = await readJSON('chats.json');

        if (!chats[jobId]) {
            chats[jobId] = [];
        }

        chats[jobId].push(newMessage);
        await writeJSON('chats.json', chats);

        res.json({
            success: true,
            message: newMessage
        });
    } catch (error) {
        next(error);
    }
});

/**
 * Setup Socket.io handlers for real-time chat
 * @param {SocketIO.Server} io - Socket.io server instance
 */
export function setupChatSocket(io) {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Join a job's chat room
        socket.on('join-chat', (jobId) => {
            socket.join(`job-${jobId}`);
            console.log(`Socket ${socket.id} joined job-${jobId}`);
        });

        // Send message
        socket.on('send-message', async (data) => {
            try {
                const { jobId, senderId, senderName, message } = data;

                const newMessage = {
                    id: uuidv4(),
                    senderId,
                    senderName,
                    message,
                    timestamp: new Date().toISOString()
                };

                // Save to database
                const chats = await readJSON('chats.json');
                if (!chats[jobId]) {
                    chats[jobId] = [];
                }
                chats[jobId].push(newMessage);
                await writeJSON('chats.json', chats);

                // Broadcast to room
                io.to(`job-${jobId}`).emit('new-message', newMessage);
            } catch (error) {
                console.error('Error sending message:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Leave chat room
        socket.on('leave-chat', (jobId) => {
            socket.leave(`job-${jobId}`);
            console.log(`Socket ${socket.id} left job-${jobId}`);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
}

export default router;
