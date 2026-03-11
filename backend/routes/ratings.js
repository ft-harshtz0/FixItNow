import express from 'express';
import { readJSON, writeJSON } from '../utils/storage.js';
import { ApiError } from '../middleware/errorHandler.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

/**
 * POST /api/ratings/rate/:workerId
 * Submit a rating for a worker
 */
router.post('/rate/:workerId', async (req, res, next) => {
    try {
        const { workerId } = req.params;
        const { userId, jobId, rating, review } = req.body;

        if (!userId || !jobId || !rating) {
            throw new ApiError('Missing required fields', 400);
        }

        if (rating < 1 || rating > 5) {
            throw new ApiError('Rating must be between 1 and 5', 400);
        }

        // Create rating
        const newRating = {
            id: uuidv4(),
            workerId,
            userId,
            jobId,
            rating,
            review: review || '',
            createdAt: new Date().toISOString()
        };

        const ratings = await readJSON('ratings.json');
        ratings.push(newRating);
        await writeJSON('ratings.json', ratings);

        // Update worker's average rating
        const users = await readJSON('users.json');
        const workerIndex = users.findIndex(u => u.id === workerId);

        if (workerIndex !== -1) {
            const workerRatings = ratings.filter(r => r.workerId === workerId);
            const totalRating = workerRatings.reduce((sum, r) => sum + r.rating, 0);
            const avgRating = totalRating / workerRatings.length;

            users[workerIndex].rating = Math.round(avgRating * 10) / 10; // Round to 1 decimal
            users[workerIndex].totalRatings = workerRatings.length;

            await writeJSON('users.json', users);
        }

        res.json({
            success: true,
            message: 'Rating submitted successfully',
            rating: newRating
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/ratings/worker/:workerId
 * Get all ratings for a worker
 */
router.get('/worker/:workerId', async (req, res, next) => {
    try {
        const { workerId } = req.params;

        const ratings = await readJSON('ratings.json');
        const workerRatings = ratings.filter(r => r.workerId === workerId);

        // Sort by date (newest first)
        workerRatings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Calculate average
        const avgRating = workerRatings.length > 0
            ? workerRatings.reduce((sum, r) => sum + r.rating, 0) / workerRatings.length
            : 0;

        res.json({
            success: true,
            ratings: workerRatings,
            averageRating: Math.round(avgRating * 10) / 10,
            totalRatings: workerRatings.length
        });
    } catch (error) {
        next(error);
    }
});

export default router;
