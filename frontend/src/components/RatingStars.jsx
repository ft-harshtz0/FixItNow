export default function RatingStars({ rating = 0, readonly = false, onChange }) {
    const stars = [1, 2, 3, 4, 5];

    const handleClick = (value) => {
        if (!readonly && onChange) {
            onChange(value);
        }
    };

    return (
        <div className="flex items-center gap-1">
            {stars.map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => handleClick(star)}
                    disabled={readonly}
                    className={`text-2xl transition-all ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
                        }`}
                >
                    {star <= rating ? (
                        <span className="text-yellow-400">★</span>
                    ) : (
                        <span className="text-gray-300">★</span>
                    )}
                </button>
            ))}
        </div>
    );
}
