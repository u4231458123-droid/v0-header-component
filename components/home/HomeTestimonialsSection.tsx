"use client"

import { useState, useEffect } from "react"
import { V28MarketingSection } from "@/components/design-system/V28MarketingSection"
import { V28MarketingCard } from "@/components/design-system/V28MarketingCard"
import { V28SliderControls } from "@/components/home/V28SliderControls"
import { testimonials } from "@/data/testimonials"
import { cn } from "@/lib/utils"

const Building2Icon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
    <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
    <path d="M10 6h4" />
    <path d="M10 10h4" />
    <path d="M10 14h4" />
    <path d="M10 18h4" />
  </svg>
)

interface StarIconProps {
  className?: string
  fill?: string
  stroke?: string
}

const StarIcon = ({ className, fill = "none", stroke = "currentColor" }: StarIconProps) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill={fill}
    stroke={stroke}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

export const HomeTestimonialsSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isSliderPaused, setIsSliderPaused] = useState(false)

  const testimonialsPerPage = 3
  const totalPages = Math.ceil(testimonials.length / testimonialsPerPage)

  useEffect(() => {
    if (isSliderPaused) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalPages)
    }, 5000)
    return () => clearInterval(interval)
  }, [totalPages, isSliderPaused])

  return (
    <V28MarketingSection
      background="white"
      title="Was unsere Kunden sagen"
      description="Professionelle Unternehmen vertrauen auf MyDispatch"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials
            .slice(currentSlide * testimonialsPerPage, (currentSlide + 1) * testimonialsPerPage)
            .map((testimonial, idx) => (
              <V28MarketingCard
                key={idx}
                className={cn(
                  "transition-all duration-300",
                  "hover:shadow-2xl hover:scale-[1.02]",
                  "relative overflow-hidden group",
                )}
                onMouseEnter={() => setIsSliderPaused(true)}
                onMouseLeave={() => setIsSliderPaused(false)}
              >
                <div className="absolute inset-0 bg-linear-to-br from-muted/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10">
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className="w-4 h-4"
                        fill={i < testimonial.rating ? "#475569" : "none"}
                        stroke={i < testimonial.rating ? "#475569" : "#cbd5e1"}
                      />
                    ))}
                  </div>

                  <p className="font-sans text-sm leading-relaxed mb-4 italic text-muted-foreground">
                    "{testimonial.quote}"
                  </p>

                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Building2Icon className="w-4 h-4 text-primary" />
                    </div>
                    <p className="font-sans text-sm font-semibold text-foreground">{testimonial.company}</p>
                  </div>
                </div>
              </V28MarketingCard>
            ))}
        </div>

        <V28SliderControls
          currentSlide={currentSlide}
          totalSlides={totalPages}
          onPrevious={() => setCurrentSlide((prev) => (prev - 1 + totalPages) % totalPages)}
          onNext={() => setCurrentSlide((prev) => (prev + 1) % totalPages)}
          onDotClick={(idx) => setCurrentSlide(idx)}
          isPaused={isSliderPaused}
          onTogglePause={() => setIsSliderPaused(!isSliderPaused)}
        />
      </div>
    </V28MarketingSection>
  )
}

export default HomeTestimonialsSection
