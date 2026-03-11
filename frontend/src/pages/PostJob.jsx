import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobAPI } from '../api/endpoints';
import AIAnalysisCard from '../components/AIAnalysisCard';
import WorkerCard from '../components/WorkerCard';

export default function PostJob() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        address: '',
        contact: '',
        category: 'plumber',
        location: user?.location || ''
    });
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [jobResult, setJobResult] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!image) {
            alert('Please upload an image');
            return;
        }

        setLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('image', image);
            formDataToSend.append('userId', user.id);
            Object.keys(formData).forEach(key => {
                formDataToSend.append(key, formData[key]);
            });

            const response = await jobAPI.create(formDataToSend);
            setJobResult(response.data.job);
        } catch (error) {
            alert('Error creating job: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    if (jobResult) {
        return (
            <div className="container mx-auto px-6 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Success Message */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 mb-8 text-center">
                        <div className="text-5xl mb-4">✅</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Posted Successfully!</h2>
                        <p className="text-gray-600">Our AI has analyzed your job and recommended the best workers</p>
                    </div>

                    {/* AI Analysis */}
                    <div className="mb-8">
                        <AIAnalysisCard analysis={jobResult.aiAnalysis} />
                    </div>

                    {/* Recommended Workers */}
                    {jobResult.recommendedWorkers && jobResult.recommendedWorkers.length > 0 && (
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                🎯 Recommended Workers
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Based on AI analysis, here are the top workers for your job
                            </p>
                            <div className="grid md:grid-cols-2 gap-4">
                                {jobResult.recommendedWorkers.map((worker, idx) => (
                                    <WorkerCard key={idx} worker={worker} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => navigate('/consumer/dashboard')}
                            className="btn-primary"
                        >
                            Go to Dashboard
                        </button>
                        <button
                            onClick={() => navigate(`/job/${jobResult.id}`)}
                            className="btn-secondary"
                        >
                            View Job Details
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Post a New Job</h1>
                    <p className="text-gray-600">Describe your issue and upload an image for AI analysis</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Image Upload */}
                        <div>
                            <label className="input-label">Upload Image *</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-500 transition-colors">
                                {imagePreview ? (
                                    <div className="relative">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="max-h-64 mx-auto rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setImage(null);
                                                setImagePreview('');
                                            }}
                                            className="mt-4 btn-outline"
                                        >
                                            Change Image
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="text-6xl mb-4">📸</div>
                                        <p className="text-gray-600 mb-4">Click to upload or drag and drop</p>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                            id="image-upload"
                                        />
                                        <label htmlFor="image-upload" className="btn-primary cursor-pointer">
                                            Choose Image
                                        </label>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Job Details */}
                        <div>
                            <label className="input-label">Job Title *</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="input-field"
                                placeholder="e.g., Leaking kitchen faucet"
                            />
                        </div>

                        <div>
                            <label className="input-label">Description *</label>
                            <textarea
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="input-field"
                                rows="4"
                                placeholder="Describe the issue in detail..."
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="input-label">Category *</label>
                                <select
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="plumber">Plumber</option>
                                    <option value="electrician">Electrician</option>
                                    <option value="carpenter">Carpenter</option>
                                    <option value="mechanic">Mechanic</option>
                                    <option value="painter">Painter</option>
                                </select>
                            </div>

                            <div>
                                <label className="input-label">Location *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="input-field"
                                    placeholder="City, State"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="input-label">Address *</label>
                            <input
                                type="text"
                                required
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="input-field"
                                placeholder="123 Main St, Apt 4B"
                            />
                        </div>

                        <div>
                            <label className="input-label">Contact Number *</label>
                            <input
                                type="tel"
                                required
                                value={formData.contact}
                                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                className="input-field"
                                placeholder="(555) 123-4567"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary disabled:opacity-50"
                        >
                            {loading ? 'Creating Job & Analyzing...' : 'Post Job'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
