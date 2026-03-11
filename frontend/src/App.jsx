import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import ConsumerDashboard from './pages/ConsumerDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import PostJob from './pages/PostJob';
import JobDetails from './pages/JobDetails';

function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="animate-pulse-slow text-gray-400">Loading...</div>
        </div>;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" />;
    }

    return children;
}

function AppRoutes() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen">
            <Navbar />
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={
                    user ? <Navigate to={user.role === 'consumer' ? '/consumer/dashboard' : '/worker/dashboard'} /> : <Login />
                } />
                <Route path="/register" element={
                    user ? <Navigate to={user.role === 'consumer' ? '/consumer/dashboard' : '/worker/dashboard'} /> : <Register />
                } />

                {/* Consumer Routes */}
                <Route path="/consumer/dashboard" element={
                    <ProtectedRoute allowedRoles={['consumer']}>
                        <ConsumerDashboard />
                    </ProtectedRoute>
                } />
                <Route path="/post-job" element={
                    <ProtectedRoute allowedRoles={['consumer']}>
                        <PostJob />
                    </ProtectedRoute>
                } />

                {/* Worker Routes */}
                <Route path="/worker/dashboard" element={
                    <ProtectedRoute allowedRoles={['worker']}>
                        <WorkerDashboard />
                    </ProtectedRoute>
                } />

                {/* Shared Routes */}
                <Route path="/job/:jobId" element={
                    <ProtectedRoute>
                        <JobDetails />
                    </ProtectedRoute>
                } />

                {/* Default Route */}
                <Route path="/" element={
                    user ? (
                        <Navigate to={user.role === 'consumer' ? '/consumer/dashboard' : '/worker/dashboard'} />
                    ) : (
                        <Navigate to="/login" />
                    )
                } />
            </Routes>
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}
