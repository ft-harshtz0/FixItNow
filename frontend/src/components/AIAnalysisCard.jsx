export default function AIAnalysisCard({ analysis }) {
    if (!analysis) return null;

    const severityColors = {
        low: 'bg-green-100 text-green-800 border-green-300',
        medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        high: 'bg-red-100 text-red-800 border-red-300'
    };

    const confidencePercentage = Math.round((analysis.confidence || 0) * 100);

    return (
        <div className="glass-card p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🤖</span>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-800">AI Analysis Results</h3>
                    <p className="text-sm text-gray-600">Powered by machine learning</p>
                </div>
            </div>

            <div className="space-y-4">
                {/* Problem Description */}
                <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Problem Description
                    </label>
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
                        <p className="text-gray-800 leading-relaxed">
                            {analysis.description}
                        </p>
                    </div>
                </div>

                {/* Severity Level */}
                <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">
                        Severity Level
                    </label>
                    <div className={`inline-flex items-center px-4 py-2 rounded-lg font-semibold capitalize border-2 ${severityColors[analysis.severity]}`}>
                        {analysis.severity}
                    </div>
                </div>

                {/* Issue Tags */}
                {analysis.issue_tags && analysis.issue_tags.length > 0 && (
                    <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">
                            Detected Issues
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {analysis.issue_tags.map((tag, idx) => (
                                <span
                                    key={idx}
                                    className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Confidence Score */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-semibold text-gray-700">
                            Confidence Score
                        </label>
                        <span className="text-sm font-bold text-primary-600">
                            {confidencePercentage}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
                            style={{ width: `${confidencePercentage}%` }}
                        />
                    </div>
                </div>

                {/* Analysis Method */}
                {analysis.analysis_method && (
                    <div className="text-xs text-gray-500 italic">
                        Analysis method: {analysis.analysis_method}
                    </div>
                )}
            </div>
        </div>
    );
}
