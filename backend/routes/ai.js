import express from 'express';
import { analyzeImage } from '../ml/imageAnalyzer.js';
import { recommendWorkers } from '../ml/recommender.js';
import { ApiError } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * POST /api/ai/analyze-image
 * Analyze uploaded image for issue detection
 */
router.post('/analyze-image', async (req, res, next) => {
    try {
        const { imagePath } = req.body;

        if (!imagePath) {
            throw new ApiError('Image path is required', 400);
        }

        const analysis = await analyzeImage(imagePath);

        res.json({
            success: true,
            analysis
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/ai/recommend-workers
 * Get smart worker recommendations
 */
router.post('/recommend-workers', async (req, res, next) => {
    try {
        const { category, location, severity } = req.body;

        if (!category || !location) {
            throw new ApiError('Category and location are required', 400);
        }

        const recommendations = await recommendWorkers({
            category,
            location,
            severity: severity || 'medium'
        });

        res.json({
            success: true,
            recommendations
        });
    } catch (error) {
        next(error);
    }
});

export default router;
