import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout, isConsumer, isWorker } = useAuth();

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 mb-8">
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary-600 rounded-md flex items-center justify-center">
                            <span className="text-white font-bold text-lg">F</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900">FixItNow</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="flex items-center space-x-6">
                        {user ? (
                            <>
                                <Link
                                    to={isConsumer ? '/consumer/dashboard' : '/worker/dashboard'}
                                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                                >
                                    Dashboard
                                </Link>

                                {isConsumer && (
                                    <Link
                                        to="/post-job"
                                        className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                                    >
                                        Post Job
                                    </Link>
                                )}

                                <div className="flex items-center space-x-4 ml-2 pl-6 border-l border-gray-200">
                                    <div className="text-right hidden md:block">
                                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                        <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                                    </div>
                                    <button
                                        onClick={logout}
                                        className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="btn-primary"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
