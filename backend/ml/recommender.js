import { readJSON } from '../utils/storage.js';

/**
 * Smart worker recommendation engine
 * Recommends best workers based on multiple factors
 * 
 * @param {Object} jobData - Job information
 * @param {string} jobData.category - Job category
 * @param {string} jobData.location - Job location
 * @param {string} jobData.severity - Issue severity
 * @returns {Promise<Array>} Ranked list of recommended workers
 */
export async function recommendWorkers(jobData) {
    try {
        const { category, location, severity } = jobData;

        // Get all users
        const users = await readJSON('users.json');
        const jobs = await readJSON('jobs.json');

        // Filter workers by category
        const workers = users.filter(u => u.role === 'worker' && u.category === category);

        if (workers.length === 0) {
            return [];
        }

        // Calculate scores for each worker
        const scoredWorkers = workers.map(worker => {
            const score = calculateWorkerScore(worker, location, severity, jobs);
            return {
                workerId: worker.id,
                workerName: worker.name,
                workerEmail: worker.email,
                category: worker.category,
                location: worker.location,
                rating: worker.rating || 0,
                completedJobs: worker.completedJobs || 0,
                score: score,
                scoreBreakdown: getScoreBreakdown(worker, location, severity, jobs)
            };
        });

        // Sort by score (descending)
        scoredWorkers.sort((a, b) => b.score - a.score);

        return scoredWorkers;
    } catch (error) {
        console.error('Error recommending workers:', error);
        throw error;
    }
}

/**
 * Calculate worker score based on multiple factors
 * Formula: score = (0.4 * rating) + (0.2 * experience) + (0.2 * distance) + (0.2 * responseSpeed)
 */
function calculateWorkerScore(worker, jobLocation, severity, allJobs) {
    // Rating score (0-1)
    const ratingScore = worker.rating ? worker.rating / 5 : 0.5; // Default 0.5 if no ratings

    // Experience score (0-1)
    const completedJobs = worker.completedJobs || 0;
    const experienceScore = Math.min(completedJobs / 50, 1); // Max out at 50 jobs

    // Distance score (0-1) - same location = 1, different = 0.5
    const distanceScore = worker.location === jobLocation ? 1 : 0.5;

    // Response speed score (0-1) - based on past response times
    const responseSpeedScore = calculateResponseSpeed(worker.id, allJobs);

    // Weighted sum
    const score = (
        0.4 * ratingScore +
        0.2 * experienceScore +
        0.2 * distanceScore +
        0.2 * responseSpeedScore
    );

    return Math.round(score * 100) / 100; // Round to 2 decimals
}

/**
 * Calculate average response speed for a worker
 */
function calculateResponseSpeed(workerId, allJobs) {
    const workerJobs = allJobs.filter(job =>
        job.responses && job.responses.some(r => r.workerId === workerId)
    );

    if (workerJobs.length === 0) {
        return 0.7; // Default score for new workers
    }

    let totalResponseTime = 0;
    let count = 0;

    workerJobs.forEach(job => {
        const response = job.responses.find(r => r.workerId === workerId);
        if (response) {
            const jobCreated = new Date(job.createdAt);
            const responseTime = new Date(response.respondedAt);
            const hoursDiff = (responseTime - jobCreated) / (1000 * 60 * 60);

            totalResponseTime += hoursDiff;
            count++;
        }
    });

    const avgResponseHours = totalResponseTime / count;

    // Convert to score: < 2 hours = 1.0, > 48 hours = 0.2
    if (avgResponseHours < 2) return 1.0;
    if (avgResponseHours > 48) return 0.2;
    return 1 - ((avgResponseHours - 2) / 46) * 0.8;
}

/**
 * Get detailed score breakdown for transparency
 */
function getScoreBreakdown(worker, jobLocation, severity, allJobs) {
    const ratingScore = worker.rating ? worker.rating / 5 : 0.5;
    const experienceScore = Math.min((worker.completedJobs || 0) / 50, 1);
    const distanceScore = worker.location === jobLocation ? 1 : 0.5;
    const responseSpeedScore = calculateResponseSpeed(worker.id, allJobs);

    return {
        rating: Math.round(ratingScore * 100) / 100,
        experience: Math.round(experienceScore * 100) / 100,
        distance: Math.round(distanceScore * 100) / 100,
        responseSpeed: Math.round(responseSpeedScore * 100) / 100
    };
}
