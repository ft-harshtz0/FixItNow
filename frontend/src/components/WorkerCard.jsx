import RatingStars from './RatingStars';

export default function WorkerCard({ worker, onSelect }) {
    return (
        <div className="glass-card p-5 hover-lift animate-fade-in">
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h4 className="text-lg font-bold text-gray-800">{worker.workerName || worker.name}</h4>
                    <p className="text-sm text-gray-600 capitalize">{worker.category}</p>
                    <p className="text-xs text-gray-500">{worker.location}</p>
                </div>

                {worker.score && (
                    <div className="text-right">
                        <div className="text-2xl font-bold gradient-text">
                            {Math.round(worker.score * 100)}%
                        </div>
                        <p className="text-xs text-gray-500">Match Score</p>
                    </div>
                )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-3">
                <RatingStars rating={worker.rating || 0} readonly />
                <span className="text-sm text-gray-600">
                    ({worker.completedJobs || 0} jobs)
                </span>
            </div>

            {/* Score Breakdown */}
            {worker.scoreBreakdown && (
                <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                    <div className="bg-blue-50 rounded-lg p-2">
                        <span className="text-gray-600">Rating:</span>
                        <span className="font-semibold ml-1">{Math.round(worker.scoreBreakdown.rating * 100)}%</span>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2">
                        <span className="text-gray-600">Experience:</span>
                        <span className="font-semibold ml-1">{Math.round(worker.scoreBreakdown.experience * 100)}%</span>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-2">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-semibold ml-1">{Math.round(worker.scoreBreakdown.distance * 100)}%</span>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-2">
                        <span className="text-gray-600">Speed:</span>
                        <span className="font-semibold ml-1">{Math.round(worker.scoreBreakdown.responseSpeed * 100)}%</span>
                    </div>
                </div>
            )}

            {onSelect && (
                <button
                    onClick={() => onSelect(worker)}
                    className="w-full btn-primary"
                >
                    Select Worker
                </button>
            )}
        </div>
    );
}
