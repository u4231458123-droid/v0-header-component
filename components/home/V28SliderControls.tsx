"use client"

/* ==================================================================================
   V28 SLIDER CONTROLS - WCAG 2.1 AA COMPLIANT
   ================================================================================== */

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}
function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
function PauseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="14" y="4" width="4" height="16" rx="1" />
      <rect x="6" y="4" width="4" height="16" rx="1" />
    </svg>
  )
}
function PlayIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="6 3 20 12 6 21 6 3" />
    </svg>
  )
}
import { designTokens } from "@/config/design-tokens"

interface V28SliderControlsProps {
  currentSlide: number
  totalSlides: number
  onPrevious: () => void
  onNext: () => void
  onDotClick: (index: number) => void
  isPaused?: boolean
  onTogglePause?: () => void
}

export function V28SliderControls({
  currentSlide,
  totalSlides,
  onPrevious,
  onNext,
  onDotClick,
  isPaused = false,
  onTogglePause,
}: V28SliderControlsProps) {
  return (
    <div className="flex items-center justify-center gap-5 mt-8">
      {/* WCAG FIX: Pause/Play Button */}
      {onTogglePause && (
        <button
          onClick={onTogglePause}
          className="p-2 rounded-xl border border-slate-200 bg-card transition-all duration-300 hover:shadow-md hover:scale-[1.02] shadow-sm"
          style={{ color: designTokens.colors.primary.DEFAULT }}
          aria-label={isPaused ? "Automatische Wiedergabe starten" : "Automatische Wiedergabe pausieren"}
        >
          {isPaused ? <PlayIcon className="w-5 h-5" /> : <PauseIcon className="w-5 h-5" />}
        </button>
      )}

      {/* Previous Button */}
      <button
        onClick={onPrevious}
        className="p-2 rounded-xl border border-slate-200 bg-card transition-all duration-300 hover:shadow-md hover:scale-[1.02] shadow-sm"
        style={{ color: designTokens.colors.primary.DEFAULT }}
        aria-label="Vorheriges Testimonial"
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>

      {/* Dots mit rounded-full */}
      <div className="flex gap-2" role="group" aria-label="Testimonial-Navigation">
        {[...Array(totalSlides)].map((_, idx) => (
          <button
            key={idx}
            onClick={() => onDotClick(idx)}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              backgroundColor:
                idx === currentSlide ? designTokens.colors.primary.DEFAULT : designTokens.colors.slate[300],
            }}
            aria-label={`Gehe zu Slide ${idx + 1}`}
            aria-current={idx === currentSlide ? "true" : "false"}
          />
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={onNext}
        className="p-2 rounded-xl border border-slate-200 bg-card transition-all duration-300 hover:shadow-md hover:scale-[1.02] shadow-sm"
        style={{ color: designTokens.colors.primary.DEFAULT }}
        aria-label="Nächstes Testimonial"
      >
        <ChevronRightIcon className="w-5 h-5" />
      </button>
    </div>
  )
}
