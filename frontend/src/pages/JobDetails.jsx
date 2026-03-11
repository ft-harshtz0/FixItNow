import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobAPI, chatAPI, ratingAPI } from '../api/endpoints';
import { io } from 'socket.io-client';
import AIAnalysisCard from '../components/AIAnalysisCard';
import ChatBox from '../components/ChatBox';
import RatingStars from '../components/RatingStars';

export default function JobDetails() {
    const { jobId } = useParams();
    const { user, isConsumer } = useAuth();
    const navigate = useNavigate();

    const [job, setJob] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [selectedWorker, setSelectedWorker] = useState(null);

    useEffect(() => {
        loadJob();
        loadMessages();

        // Setup Socket.io
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        newSocket.emit('join-chat', jobId);

        newSocket.on('new-message', (message) => {
            setMessages(prev => [...prev, message]);
        });

        return () => {
            newSocket.emit('leave-chat', jobId);
            newSocket.close();
        };
    }, [jobId]);

    const loadJob = async () => {
        try {
            const response = await jobAPI.getById(jobId);
            setJob(response.data.job);
        } catch (error) {
            console.error('Error loading job:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async () => {
        try {
            const response = await chatAPI.getMessages(jobId);
            setMessages(response.data.messages);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const handleSendMessage = async (message) => {
        if (socket) {
            socket.emit('send-message', {
                jobId,
                senderId: user.id,
                senderName: user.name,
                message
            });
        }
    };

    const handleCompleteJob = async (workerId) => {
        try {
            await jobAPI.complete(jobId, {
                userId: user.id,
                workerId
            });
            setSelectedWorker(workerId);
            setShowRatingModal(true);
            loadJob();
        } catch (error) {
            alert('Error completing job: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleSubmitRating = async (e) => {
        e.preventDefault();
        try {
            await ratingAPI.rate(selectedWorker, {
                userId: user.id,
                jobId,
                rating,
                review
            });
            alert('Rating submitted successfully!');
            setShowRatingModal(false);
            navigate('/consumer/dashboard');
        } catch (error) {
            alert('Error submitting rating: ' + (error.response?.data?.error || error.message));
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-6 py-8">
                <div className="text-center py-12">
                    <div className="animate-pulse-slow text-gray-400">Loading job details...</div>
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="container mx-auto px-6 py-8">
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">❌</div>
                    <p className="text-gray-500">Job not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="glass-card p-6 mb-8">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">{job.title}</h1>
                            <p className="text-gray-600">{job.location}</p>
                            <p className="text-sm text-gray-500 mt-1">
                                Posted: {new Date(job.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        <span className={`badge ${job.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                            {job.status}
                        </span>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Job Image */}
                        <div className="glass-card p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Job Image</h3>
                            <img
                                src={job.imagePath}
                                alt={job.title}
                                className="w-full rounded-xl"
                            />
                        </div>

                        {/* Job Details */}
                        <div className="glass-card p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Details</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-semibold text-gray-700">Description</label>
                                    <p className="text-gray-600 mt-1">{job.description}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-700">Address</label>
                                    <p className="text-gray-600 mt-1">{job.address}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-700">Contact</label>
                                    <p className="text-gray-600 mt-1">{job.contact}</p>
                                </div>
                            </div>
                        </div>

                        {/* AI Analysis */}
                        {job.aiAnalysis && (
                            <AIAnalysisCard analysis={job.aiAnalysis} />
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Worker Responses */}
                        <div className="glass-card p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">
                                Worker Responses ({job.responses?.length || 0})
                            </h3>

                            {job.responses && job.responses.length > 0 ? (
                                <div className="space-y-4">
                                    {job.responses.map((response) => (
                                        <div key={response.id} className="bg-white/50 rounded-xl p-4 border-2 border-gray-200">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h4 className="font-bold text-gray-800">{response.workerName}</h4>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(response.respondedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-green-600">${response.cost}</div>
                                                    <div className="text-xs text-gray-600">{response.eta}</div>
                                                </div>
                                            </div>
                                            <p className="text-gray-700 text-sm mb-3">{response.message}</p>

                                            {isConsumer && job.status === 'open' && (
                                                <button
                                                    onClick={() => handleCompleteJob(response.workerId)}
                                                    className="btn-primary w-full"
                                                >
                                                    Select & Complete
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-8">No responses yet</p>
                            )}
                        </div>

                        {/* Chat */}
                        <ChatBox
                            messages={messages}
                            onSendMessage={handleSendMessage}
                            loading={false}
                        />
                    </div>
                </div>
            </div>

            {/* Rating Modal */}
            {showRatingModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass-card p-8 max-w-md w-full animate-slide-up">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">Rate the Worker</h3>

                        <form onSubmit={handleSubmitRating} className="space-y-6">
                            <div className="text-center">
                                <label className="input-label mb-3">Your Rating</label>
                                <div className="flex justify-center">
                                    <RatingStars rating={rating} onChange={setRating} />
                                </div>
                            </div>

                            <div>
                                <label className="input-label">Review (Optional)</label>
                                <textarea
                                    value={review}
                                    onChange={(e) => setReview(e.target.value)}
                                    className="input-field"
                                    rows="4"
                                    placeholder="Share your experience..."
                                />
                            </div>

                            <div className="flex gap-3">
                                <button type="submit" className="btn-primary flex-1" disabled={rating === 0}>
                                    Submit Rating
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowRatingModal(false)}
                                    className="btn-secondary flex-1"
                                >
                                    Skip
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
