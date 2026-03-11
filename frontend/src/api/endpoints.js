import api from './axios';

// Auth endpoints
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getCategories: () => api.get('/auth/categories')
};

// Job endpoints
export const jobAPI = {
    create: (formData) => api.post('/jobs/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getByCategory: (category, location) =>
        api.get(`/jobs/category/${category}`, { params: { location } }),
    getByUser: (userId) => api.get(`/jobs/user/${userId}`),
    getById: (jobId) => api.get(`/jobs/${jobId}`),
    respond: (jobId, data) => api.post(`/jobs/respond/${jobId}`, data),
    complete: (jobId, data) => api.post(`/jobs/complete/${jobId}`, data)
};

// Chat endpoints
export const chatAPI = {
    getMessages: (jobId) => api.get(`/chat/${jobId}`),
    sendMessage: (jobId, data) => api.post(`/chat/${jobId}`, data)
};

// Rating endpoints
export const ratingAPI = {
    rate: (workerId, data) => api.post(`/ratings/rate/${workerId}`, data),
    getWorkerRatings: (workerId) => api.get(`/ratings/worker/${workerId}`)
};

// AI endpoints
export const aiAPI = {
    analyzeImage: (imagePath) => api.post('/ai/analyze-image', { imagePath }),
    recommendWorkers: (data) => api.post('/ai/recommend-workers', data)
};
