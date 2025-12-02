"use client"

/**
 * Sentiment Badge Component
 * Zeigt das Ergebnis einer Sentiment-Analyse an
 */

interface SentimentBadgeProps {
  score: number // 1-5
  label: string
  color: string
  confidence: number
  showConfidence?: boolean
}

export function SentimentBadge({ score, label, color, confidence, showConfidence = true }: SentimentBadgeProps) {
  // Sterne für visuelles Feedback
  const stars = Array.from({ length: 5 }, (_, i) => i < score)

  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
      style={{ backgroundColor: `${color}20`, color }}
    >
      {/* Sterne */}
      <div className="flex gap-0.5">
        {stars.map((filled, i) => (
          <svg
            key={i}
            className="w-4 h-4"
            fill={filled ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        ))}
      </div>

      {/* Label */}
      <span>{label}</span>

      {/* Confidence */}
      {showConfidence && <span className="opacity-70 text-xs">({Math.round(confidence * 100)}%)</span>}
    </div>
  )
}
