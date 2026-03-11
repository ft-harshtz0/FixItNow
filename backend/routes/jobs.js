import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { readJSON, writeJSON } from '../utils/storage.js';
import { ApiError } from '../middleware/errorHandler.js';
import { v4 as uuidv4 } from 'uuid';
import { analyzeImage } from '../ml/imageAnalyzer.js';
import { recommendWorkers } from '../ml/recommender.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/job-images'));
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new ApiError('Only image files are allowed', 400));
        }
    }
});

/**
 * POST /api/jobs/create
 * Create a new job with image upload and AI analysis
 */
router.post('/create', upload.single('image'), async (req, res, next) => {
    try {
        const { title, description, address, contact, category, location, userId } = req.body;

        if (!title || !description || !address || !contact || !category || !location || !userId) {
            throw new ApiError('Missing required fields', 400);
        }

        if (!req.file) {
            throw new ApiError('Image is required', 400);
        }

        // Perform AI image analysis
        const imagePath = req.file.path;
        const aiAnalysis = await analyzeImage(imagePath);

        // Get recommended workers based on user-selected category
        const recommendedWorkers = await recommendWorkers({
            category: category,
            location,
            severity: aiAnalysis.severity
        });

        // Create job
        const newJob = {
            id: uuidv4(),
            userId,
            title,
            description,
            address,
            contact,
            category,
            location,
            imagePath: `/uploads/job-images/${req.file.filename}`,
            aiAnalysis,
            recommendedWorkers: recommendedWorkers.slice(0, 5), // Top 5
            responses: [],
            status: 'open',
            createdAt: new Date().toISOString()
        };

        const jobs = await readJSON('jobs.json');
        jobs.push(newJob);
        await writeJSON('jobs.json', jobs);

        res.status(201).json({
            success: true,
            message: 'Job created successfully',
            job: newJob
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/jobs/category/:category
 * Get jobs by category (for workers)
 */
router.get('/category/:category', async (req, res, next) => {
    try {
        const { category } = req.params;
        const { location } = req.query;

        const jobs = await readJSON('jobs.json');

        let filteredJobs = jobs.filter(job =>
            job.category === category &&
            job.status === 'open'
        );

        // Filter by location if provided
        if (location) {
            filteredJobs = filteredJobs.filter(job => job.location === location);
        }

        // Sort by creation date (newest first)
        filteredJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({
            success: true,
            jobs: filteredJobs
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/jobs/user/:userId
 * Get all jobs posted by a user
 */
router.get('/user/:userId', async (req, res, next) => {
    try {
        const { userId } = req.params;

        const jobs = await readJSON('jobs.json');
        const userJobs = jobs.filter(job => job.userId === userId);

        // Sort by creation date (newest first)
        userJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({
            success: true,
            jobs: userJobs
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/jobs/:jobId
 * Get job details by ID
 */
router.get('/:jobId', async (req, res, next) => {
    try {
        const { jobId } = req.params;

        const jobs = await readJSON('jobs.json');
        const job = jobs.find(j => j.id === jobId);

        if (!job) {
            throw new ApiError('Job not found', 404);
        }

        res.json({
            success: true,
            job
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/jobs/respond/:jobId
 * Worker responds to a job
 */
router.post('/respond/:jobId', async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const { workerId, workerName, eta, cost, message } = req.body;

        if (!workerId || !workerName || !eta || !cost || !message) {
            throw new ApiError('Missing required fields', 400);
        }

        const jobs = await readJSON('jobs.json');
        const jobIndex = jobs.findIndex(j => j.id === jobId);

        if (jobIndex === -1) {
            throw new ApiError('Job not found', 404);
        }

        // Check if worker already responded
        const existingResponse = jobs[jobIndex].responses.find(r => r.workerId === workerId);
        if (existingResponse) {
            throw new ApiError('You have already responded to this job', 400);
        }

        const response = {
            id: uuidv4(),
            workerId,
            workerName,
            eta,
            cost,
            message,
            respondedAt: new Date().toISOString()
        };

        jobs[jobIndex].responses.push(response);
        await writeJSON('jobs.json', jobs);

        res.json({
            success: true,
            message: 'Response submitted successfully',
            response
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/jobs/complete/:jobId
 * Mark job as complete
 */
router.post('/complete/:jobId', async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const { userId, workerId } = req.body;

        const jobs = await readJSON('jobs.json');
        const jobIndex = jobs.findIndex(j => j.id === jobId);

        if (jobIndex === -1) {
            throw new ApiError('Job not found', 404);
        }

        if (jobs[jobIndex].userId !== userId) {
            throw new ApiError('Unauthorized', 403);
        }

        jobs[jobIndex].status = 'completed';
        jobs[jobIndex].completedAt = new Date().toISOString();
        jobs[jobIndex].completedBy = workerId;

        await writeJSON('jobs.json', jobs);

        // Update worker's completed jobs count
        const users = await readJSON('users.json');
        const workerIndex = users.findIndex(u => u.id === workerId);
        if (workerIndex !== -1) {
            users[workerIndex].completedJobs = (users[workerIndex].completedJobs || 0) + 1;
            await writeJSON('users.json', users);
        }

        res.json({
            success: true,
            message: 'Job marked as complete',
            job: jobs[jobIndex]
        });
    } catch (error) {
        next(error);
    }
});

export default router;
