"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle2,
  Circle,
  UserPlus,
  Car,
  Calendar,
  FileText,
  Sparkles,
  ArrowRight,
} from "lucide-react"

interface Step {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  completed: boolean
}

const INITIAL_STEPS: Step[] = [
  {
    id: "driver",
    title: "Ersten Fahrer anlegen",
    description: "Erfassen Sie Ihre Fahrer mit allen wichtigen Informationen",
    icon: UserPlus,
    href: "/fahrer",
    completed: false,
  },
  {
    id: "vehicle",
    title: "Erstes Fahrzeug hinzufügen",
    description: "Digitalisieren Sie Ihren Fuhrpark",
    icon: Car,
    href: "/fleet",
    completed: false,
  },
  {
    id: "booking",
    title: "Erste Buchung erstellen",
    description: "Legen Sie Ihren ersten Auftrag an",
    icon: Calendar,
    href: "/auftraege",
    completed: false,
  },
  {
    id: "invoice",
    title: "Erste Rechnung erstellen",
    description: "Starten Sie mit der GoBD-konformen Abrechnung",
    icon: FileText,
    href: "/rechnungen",
    completed: false,
  },
]

interface FirstStepsWizardProps {
  onComplete?: () => void
  companyId: string | null
}

export function FirstStepsWizard({ onComplete, companyId }: FirstStepsWizardProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS)
  const [isMinimized, setIsMinimized] = useState(false)

  const completedCount = steps.filter((s) => s.completed).length
  const totalCount = steps.length
  const progress = (completedCount / totalCount) * 100
  const allCompleted = completedCount === totalCount

  // Check localStorage for wizard state
  useEffect(() => {
    const wizardDismissed = localStorage.getItem("mydispatch_wizard_dismissed")
    const tourCompleted = localStorage.getItem("mydispatch_tour_completed")

    if (!wizardDismissed && tourCompleted) {
      setIsVisible(true)
      loadStepProgress()
    }
  }, [])

  // Load step progress from localStorage
  const loadStepProgress = () => {
    const savedProgress = localStorage.getItem("mydispatch_wizard_progress")
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress)
        setSteps((prevSteps) =>
          prevSteps.map((step) => ({
            ...step,
            completed: progress[step.id] || false,
          }))
        )
      } catch (e) {
        console.error("Error loading wizard progress:", e)
      }
    }
  }

  // Save step progress to localStorage
  const saveStepProgress = (updatedSteps: Step[]) => {
    const progress = updatedSteps.reduce(
      (acc, step) => ({
        ...acc,
        [step.id]: step.completed,
      }),
      {}
    )
    localStorage.setItem("mydispatch_wizard_progress", JSON.stringify(progress))
  }

  // Check if steps are completed (would need API calls in real implementation)
  useEffect(() => {
    if (!isVisible || !companyId) return

    // In a real implementation, you would check via API:
    // - Has at least 1 driver
    // - Has at least 1 vehicle
    // - Has at least 1 booking
    // - Has at least 1 invoice

    // For now, we just load from localStorage
    loadStepProgress()
  }, [isVisible, companyId])

  const handleStepClick = (step: Step) => {
    window.location.href = step.href
  }

  const handleDismiss = () => {
    localStorage.setItem("mydispatch_wizard_dismissed", "true")
    setIsVisible(false)
  }

  const handleComplete = () => {
    localStorage.setItem("mydispatch_wizard_completed", "true")
    localStorage.setItem("mydispatch_wizard_dismissed", "true")
    setIsVisible(false)
    onComplete?.()
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className={`fixed bottom-6 right-6 z-50 ${isMinimized ? "w-auto" : "w-[420px]"}`}
      >
        {isMinimized ? (
          <Button
            onClick={() => setIsMinimized(false)}
            className="shadow-2xl"
            size="lg"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Erste Schritte ({completedCount}/{totalCount})
          </Button>
        ) : (
          <Card className="shadow-2xl border-2 border-primary/20">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Erste Schritte</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {completedCount} von {totalCount} abgeschlossen
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMinimized(true)}
                    className="h-8 px-2"
                  >
                    Minimieren
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDismiss}
                    className="h-8 px-2 text-muted-foreground"
                  >
                    Schließen
                  </Button>
                </div>
              </div>

              <Progress value={progress} className="mt-3" />

              {allCompleted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-3"
                >
                  <Badge className="bg-green-500 text-white">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Alle Schritte abgeschlossen! 🎉
                  </Badge>
                </motion.div>
              )}
            </CardHeader>

            <CardContent className="space-y-2">
              {steps.map((step, index) => {
                const Icon = step.icon
                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <button
                      onClick={() => handleStepClick(step)}
                      className={`w-full flex items-start gap-3 p-3 rounded-lg border-2 transition-all ${
                        step.completed
                          ? "border-green-500/20 bg-green-500/5"
                          : "border-border hover:border-primary/30 hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {step.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>

                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <h4 className="font-medium text-sm">{step.title}</h4>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {step.description}
                        </p>
                      </div>

                      {!step.completed && (
                        <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                      )}
                    </button>
                  </motion.div>
                )
              })}

              {allCompleted && (
                <Button
                  onClick={handleComplete}
                  className="w-full mt-4"
                  size="lg"
                >
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Erste Schritte abschließen
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

