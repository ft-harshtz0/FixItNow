import express from 'express';
import { readJSON, writeJSON } from '../utils/storage.js';
import { ApiError } from '../middleware/errorHandler.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

const WORKER_CATEGORIES = ['plumber', 'electrician', 'carpenter', 'mechanic', 'painter'];

/**
 * POST /api/auth/register
 * Register a new user (consumer or worker)
 */
router.post('/register', async (req, res, next) => {
    try {
        const { email, password, role, category, location, name } = req.body;

        // Validation
        if (!email || !password || !role || !location || !name) {
            throw new ApiError('Missing required fields', 400);
        }

        if (!['consumer', 'worker'].includes(role)) {
            throw new ApiError('Invalid role. Must be consumer or worker', 400);
        }

        if (role === 'worker' && !category) {
            throw new ApiError('Workers must specify a category', 400);
        }

        if (role === 'worker' && !WORKER_CATEGORIES.includes(category)) {
            throw new ApiError(`Invalid category. Must be one of: ${WORKER_CATEGORIES.join(', ')}`, 400);
        }

        // Check if user already exists
        const users = await readJSON('users.json');
        const existingUser = users.find(u => u.email === email);

        if (existingUser) {
            throw new ApiError('User with this email already exists', 409);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = {
            id: uuidv4(),
            email,
            password: hashedPassword,
            name,
            role,
            location,
            ...(role === 'worker' && {
                category,
                rating: 0,
                completedJobs: 0,
                totalRatings: 0
            }),
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        await writeJSON('users.json', users);

        // Return user without password
        const { password: _, ...userWithoutPassword } = newUser;

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: userWithoutPassword
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new ApiError('Email and password are required', 400);
        }

        // Find user
        const users = await readJSON('users.json');
        const user = users.find(u => u.email === email);

        if (!user) {
            throw new ApiError('Invalid credentials', 401);
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            throw new ApiError('Invalid credentials', 401);
        }

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            success: true,
            message: 'Login successful',
            user: userWithoutPassword
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/auth/categories
 * Get available worker categories
 */
router.get('/categories', (req, res) => {
    res.json({
        success: true,
        categories: WORKER_CATEGORIES
    });
});

export default router;
