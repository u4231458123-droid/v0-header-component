"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { X, ArrowRight, ArrowLeft, Sparkles, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

interface TourStep {
  id: string
  title: string
  description: string
  targetSelector: string
  position: "top" | "bottom" | "left" | "right"
  action?: {
    label: string
    href: string
  }
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Willkommen bei MyDispatch! 🎉",
    description: "In den nächsten Schritten zeigen wir Ihnen die wichtigsten Funktionen. Lassen Sie sich von uns durch Ihr neues Dashboard führen.",
    targetSelector: "[data-tour='dashboard-header']",
    position: "bottom",
  },
  {
    id: "stats",
    title: "Ihre Kennzahlen im Blick",
    description: "Hier sehen Sie auf einen Blick: Heutige Buchungen, aktive Aufträge, verfügbare Fahrer und offene Rechnungen. Alles, was Sie für den Überblick brauchen.",
    targetSelector: "[data-tour='dashboard-stats']",
    position: "bottom",
  },
  {
    id: "quick-actions",
    title: "Schnellzugriff",
    description: "Die wichtigsten Aktionen direkt griffbereit: Neue Buchung, Fahrer disponieren, Rechnung erstellen. Ein Klick genügt.",
    targetSelector: "[data-tour='quick-actions']",
    position: "left",
  },
  {
    id: "drivers",
    title: "Fahrer verwalten",
    description: "Legen Sie Ihre Fahrer an, verwalten Sie Schichten und behalten Sie den Überblick über Verfügbarkeiten.",
    targetSelector: "[data-tour='sidebar-drivers']",
    position: "right",
    action: {
      label: "Ersten Fahrer anlegen",
      href: "/fahrer",
    },
  },
  {
    id: "fleet",
    title: "Fuhrpark digitalisieren",
    description: "Erfassen Sie Ihre Fahrzeuge mit allen Details: TÜV-Termine, Konzessionen, Wartungen – alles an einem Ort.",
    targetSelector: "[data-tour='sidebar-fleet']",
    position: "right",
    action: {
      label: "Erstes Fahrzeug hinzufügen",
      href: "/fleet",
    },
  },
  {
    id: "bookings",
    title: "Aufträge disponieren",
    description: "Erstellen Sie Buchungen, weisen Sie Fahrer zu und behalten Sie alle Aufträge im Blick. Die KI unterstützt Sie bei der optimalen Disposition.",
    targetSelector: "[data-tour='sidebar-bookings']",
    position: "right",
    action: {
      label: "Erste Buchung erstellen",
      href: "/auftraege",
    },
  },
]

interface DashboardTourProps {
  onComplete?: () => void
  onSkip?: () => void
}

export function DashboardTour({ onComplete, onSkip }: DashboardTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)
  const [spotlightPosition, setSpotlightPosition] = useState({ top: 0, left: 0, width: 0, height: 0 })

  const currentStepData = TOUR_STEPS[currentStep]
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100
  const isLastStep = currentStep === TOUR_STEPS.length - 1

  // Check if tour was already completed
  useEffect(() => {
    const tourCompleted = localStorage.getItem("mydispatch_tour_completed")
    if (!tourCompleted) {
      // Wait for DOM to be ready
      setTimeout(() => setIsVisible(true), 500)
    }
  }, [])

  // Update spotlight position
  useEffect(() => {
    if (!isVisible || !currentStepData) return

    const element = document.querySelector(currentStepData.targetSelector) as HTMLElement
    if (element) {
      setTargetElement(element)
      const rect = element.getBoundingClientRect()
      setSpotlightPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      })

      // Scroll element into view
      element.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [currentStep, isVisible, currentStepData])

  const handleNext = () => {
    if (isLastStep) {
      handleComplete()
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleComplete = () => {
    // Success celebration! 🎉
    toast.success("🎉 Tour abgeschlossen!", {
      description: "Sie kennen jetzt die wichtigsten Funktionen von MyDispatch.",
      duration: 4000,
    })

    localStorage.setItem("mydispatch_tour_completed", "true")
    setIsVisible(false)
    onComplete?.()
  }

  const handleSkip = () => {
    localStorage.setItem("mydispatch_tour_completed", "true")
    setIsVisible(false)
    onSkip?.()
  }

  if (!isVisible || !currentStepData) return null

  // Calculate tooltip position based on target element
  const getTooltipPosition = () => {
    if (!targetElement) return {}

    const padding = 16
    const position = currentStepData.position

    switch (position) {
      case "bottom":
        return {
          top: spotlightPosition.top + spotlightPosition.height + padding,
          left: spotlightPosition.left + spotlightPosition.width / 2,
          transform: "translateX(-50%)",
        }
      case "top":
        return {
          top: spotlightPosition.top - padding,
          left: spotlightPosition.left + spotlightPosition.width / 2,
          transform: "translate(-50%, -100%)",
        }
      case "right":
        return {
          top: spotlightPosition.top + spotlightPosition.height / 2,
          left: spotlightPosition.left + spotlightPosition.width + padding,
          transform: "translateY(-50%)",
        }
      case "left":
        return {
          top: spotlightPosition.top + spotlightPosition.height / 2,
          left: spotlightPosition.left - padding,
          transform: "translate(-100%, -50%)",
        }
      default:
        return {}
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Overlay with spotlight effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100]"
            style={{
              background: `radial-gradient(
                circle at ${spotlightPosition.left + spotlightPosition.width / 2}px ${spotlightPosition.top + spotlightPosition.height / 2}px,
                transparent 0px,
                transparent ${Math.max(spotlightPosition.width, spotlightPosition.height) / 2 + 20}px,
                rgba(0, 0, 0, 0.7) ${Math.max(spotlightPosition.width, spotlightPosition.height) / 2 + 40}px
              )`,
              pointerEvents: "none",
            }}
          />

          {/* Highlight border around target element */}
          {targetElement && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="fixed z-[101] border-4 border-primary rounded-xl pointer-events-none"
              style={{
                top: spotlightPosition.top - 8,
                left: spotlightPosition.left - 8,
                width: spotlightPosition.width + 16,
                height: spotlightPosition.height + 16,
                boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
              }}
            />
          )}

          {/* Tour Tooltip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.2 }}
            className="fixed z-[102]"
            style={getTooltipPosition()}
          >
            <Card className="w-[400px] shadow-2xl border-2 border-primary/20">
              <CardHeader className="pb-3 relative">
                <div className="flex items-start justify-between gap-5">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{currentStepData.title}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        Schritt {currentStep + 1} von {TOUR_STEPS.length}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 -mt-1 -mr-1"
                    onClick={handleSkip}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Progress value={progress} className="mt-3" />
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {currentStepData.description}
                </p>

                {currentStepData.action && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      window.location.href = currentStepData.action!.href
                      handleComplete()
                    }}
                  >
                    {currentStepData.action.label}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}

                <div className="flex items-center justify-between gap-2 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSkip}
                    className="text-muted-foreground"
                  >
                    Tour überspringen
                  </Button>

                  <div className="flex gap-2">
                    {currentStep > 0 && (
                      <Button variant="outline" size="sm" onClick={handlePrevious}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Zurück
                      </Button>
                    )}
                    <Button size="sm" onClick={handleNext}>
                      {isLastStep ? (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Fertig
                        </>
                      ) : (
                        <>
                          Weiter
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

