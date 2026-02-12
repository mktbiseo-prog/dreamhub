"use client";

import { useState } from "react";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
}

export function StarRating({ value, onChange, max = 5 }: StarRatingProps) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1" onMouseLeave={() => setHovered(0)}>
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1;
        const filled = starValue <= (hovered || value);

        return (
          <button
            key={starValue}
            type="button"
            className="transition-transform hover:scale-110"
            onMouseEnter={() => setHovered(starValue)}
            onClick={() => onChange(starValue)}
            aria-label={`Rate ${starValue} out of ${max}`}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={filled ? "#8b5cf6" : "none"}
              stroke={filled ? "#8b5cf6" : "#d1d5db"}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
