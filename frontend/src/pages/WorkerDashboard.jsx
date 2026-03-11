import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { jobAPI } from '../api/endpoints';
import JobCard from '../components/JobCard';

export default function WorkerDashboard() {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [locationFilter, setLocationFilter] = useState('');
    const [showRespondModal, setShowRespondModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [responseData, setResponseData] = useState({
        eta: '',
        cost: '',
        message: ''
    });

    useEffect(() => {
        loadJobs();
    }, [user, locationFilter]);

    const loadJobs = async () => {
        try {
            const response = await jobAPI.getByCategory(user.category, locationFilter);
            setJobs(response.data.jobs);
        } catch (error) {
            console.error('Error loading jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRespond = (job) => {
        setSelectedJob(job);
        setShowRespondModal(true);
    };

    const submitResponse = async (e) => {
        e.preventDefault();
        try {
            await jobAPI.respond(selectedJob.id, {
                workerId: user.id,
                workerName: user.name,
                ...responseData
            });

            alert('Response submitted successfully!');
            setShowRespondModal(false);
            setResponseData({ eta: '', cost: '', message: '' });
            loadJobs();
        } catch (error) {
            alert('Error submitting response: ' + (error.response?.data?.error || error.message));
        }
    };

    return (
        <div className="container mx-auto px-6 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome, {user.name}!
                </h1>
                <p className="text-gray-600">
                    Find jobs in your category: <span className="font-semibold capitalize">{user.category}</span>
                </p>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                    <div className="text-2xl mb-2">⭐</div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Your Rating</h3>
                    <div className="text-2xl font-bold text-primary-600">
                        {user.rating ? user.rating.toFixed(1) : 'N/A'}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                        {user.totalRatings || 0} reviews
                    </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                    <div className="text-2xl mb-2">✅</div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Completed Jobs</h3>
                    <div className="text-2xl font-bold text-green-600">
                        {user.completedJobs || 0}
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                    <div className="text-2xl mb-2">📋</div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Available Jobs</h3>
                    <div className="text-2xl font-bold text-primary-600">
                        {jobs.length}
                    </div>
                </div>
            </div>

            {/* Jobs List */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Available Jobs</h2>

                    {/* Location Filter */}
                    <div>
                        <input
                            type="text"
                            placeholder="Filter by location..."
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                            className="input-field w-64"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-pulse-slow text-gray-400">Loading jobs...</div>
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📭</div>
                        <p className="text-gray-500">No jobs available in your category</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {jobs.map(job => (
                            <JobCard
                                key={job.id}
                                job={job}
                                showActions
                                onRespond={handleRespond}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Response Modal */}
            {showRespondModal && (
                <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Respond to Job</h3>
                        <p className="text-gray-600 mb-6">{selectedJob.title}</p>

                        <form onSubmit={submitResponse} className="space-y-4">
                            <div>
                                <label className="input-label">Estimated Time (e.g., "2 hours", "1 day")</label>
                                <input
                                    type="text"
                                    required
                                    value={responseData.eta}
                                    onChange={(e) => setResponseData({ ...responseData, eta: e.target.value })}
                                    className="input-field"
                                    placeholder="2 hours"
                                />
                            </div>

                            <div>
                                <label className="input-label">Estimated Cost ($)</label>
                                <input
                                    type="number"
                                    required
                                    value={responseData.cost}
                                    onChange={(e) => setResponseData({ ...responseData, cost: e.target.value })}
                                    className="input-field"
                                    placeholder="150"
                                />
                            </div>

                            <div>
                                <label className="input-label">Message</label>
                                <textarea
                                    required
                                    value={responseData.message}
                                    onChange={(e) => setResponseData({ ...responseData, message: e.target.value })}
                                    className="input-field"
                                    rows="3"
                                    placeholder="Describe your approach..."
                                />
                            </div>

                            <div className="flex gap-3">
                                <button type="submit" className="btn-primary flex-1">
                                    Submit Response
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowRespondModal(false)}
                                    className="btn-secondary flex-1"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
