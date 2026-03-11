import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobAPI } from '../api/endpoints';
import JobCard from '../components/JobCard';

export default function ConsumerDashboard() {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, open, completed

    useEffect(() => {
        loadJobs();
    }, [user]);

    const loadJobs = async () => {
        try {
            const response = await jobAPI.getByUser(user.id);
            setJobs(response.data.jobs);
        } catch (error) {
            console.error('Error loading jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredJobs = jobs.filter(job => {
        if (filter === 'all') return true;
        return job.status === filter;
    });

    return (
        <div className="container mx-auto px-6 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome back, {user.name}!
                </h1>
                <p className="text-gray-600">Manage your repair requests and connect with workers</p>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Post a Job</h3>
                        <p className="text-gray-600 mb-4 text-sm">Need a repair? Post your job and get AI-powered recommendations</p>
                    </div>
                    <Link to="/post-job" className="btn-primary w-full">
                        Post New Job
                    </Link>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Your Stats</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Total Jobs:</span>
                            <span className="font-bold text-primary-600">{jobs.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Open:</span>
                            <span className="font-bold text-yellow-600">
                                {jobs.filter(j => j.status === 'open').length}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Completed:</span>
                            <span className="font-bold text-green-600">
                                {jobs.filter(j => j.status === 'completed').length}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">AI Features</h3>
                    <p className="text-gray-600 text-sm">
                        Our AI analyzes your job images and recommends the best workers for you
                    </p>
                </div>
            </div>

            {/* Jobs List */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Your Jobs</h2>

                    {/* Filter Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'all'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('open')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'open'
                                    ? 'bg-yellow-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Open
                        </button>
                        <button
                            onClick={() => setFilter('completed')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'completed'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            Completed
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-pulse-slow text-gray-400">Loading jobs...</div>
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                        <p className="text-gray-500 mb-4 font-medium">No jobs found</p>
                        <Link to="/post-job" className="btn-primary">
                            Post Your First Job
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredJobs.map(job => (
                            <JobCard key={job.id} job={job} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
