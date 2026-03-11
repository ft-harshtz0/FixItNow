import { Link } from 'react-router-dom';

export default function JobCard({ job, showActions = false, onRespond }) {
    const severityColors = {
        low: 'badge-success',
        medium: 'badge-warning',
        high: 'badge-danger'
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-4">
            <div className="flex gap-4">
                {/* Job Image */}
                <div className="flex-shrink-0">
                    <img
                        src={job.imagePath}
                        alt={job.title}
                        className="w-32 h-32 object-cover rounded-xl"
                    />
                </div>

                {/* Job Details */}
                <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-1">{job.title}</h3>
                            <p className="text-sm text-gray-600">{job.location}</p>
                        </div>
                        <span className={`${severityColors[job.aiAnalysis?.severity || 'medium']}`}>
                            {job.aiAnalysis?.severity || 'Medium'} Priority
                        </span>
                    </div>

                    <p className="text-gray-700 mb-3 line-clamp-2">{job.description}</p>

                    {/* AI Analysis Tags */}
                    {job.aiAnalysis && job.aiAnalysis.issue_tags && job.aiAnalysis.issue_tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                            {job.aiAnalysis.issue_tags.map((tag, idx) => (
                                <span key={idx} className="badge bg-purple-100 text-purple-800">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            <span>Posted: {new Date(job.createdAt).toLocaleDateString()}</span>
                            {job.responses && (
                                <span className="ml-4">
                                    {job.responses.length} response{job.responses.length !== 1 ? 's' : ''}
                                </span>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <Link
                                to={`/job/${job.id}`}
                                className="btn-outline"
                            >
                                View Details
                            </Link>
                            {showActions && onRespond && (
                                <button
                                    onClick={() => onRespond(job)}
                                    className="btn-primary"
                                >
                                    Respond
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
