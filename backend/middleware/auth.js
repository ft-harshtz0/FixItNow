import { ApiError } from './errorHandler.js';

/**
 * Simple authentication middleware
 * Validates userId in request headers
 */
export function authenticate(req, res, next) {
    const userId = req.headers['x-user-id'];

    if (!userId) {
        throw new ApiError('Authentication required', 401);
    }

    req.userId = userId;
    next();
}

/**
 * Role-based authorization middleware
 * @param {string[]} allowedRoles - Array of allowed roles
 */
export function authorize(...allowedRoles) {
    return (req, res, next) => {
        const userRole = req.headers['x-user-role'];

        if (!userRole || !allowedRoles.includes(userRole)) {
            throw new ApiError('Insufficient permissions', 403);
        }

        req.userRole = userRole;
        next();
    };
}
