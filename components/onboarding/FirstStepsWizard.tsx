"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import {
  CheckCircle2,
  Circle,
  UserPlus,
  Car,
  Calendar,
  FileText,
  Sparkles,
  ArrowRight,
  RefreshCw,
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
  const [isChecking, setIsChecking] = useState(false)

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
    }
  }, [])

  // Load step progress from localStorage (fallback)
  const loadStepProgressFromStorage = useCallback(() => {
    const savedProgress = localStorage.getItem("mydispatch_wizard_progress")
    if (savedProgress) {
      try {
        const progressData = JSON.parse(savedProgress)
        setSteps((prevSteps) =>
          prevSteps.map((step) => ({
            ...step,
            completed: progressData[step.id] || false,
          }))
        )
      } catch (e) {
        console.error("Error loading wizard progress:", e)
      }
    }
  }, [])

  // Save step progress to localStorage
  const saveStepProgress = useCallback((updatedSteps: Step[]) => {
    const progressData = updatedSteps.reduce(
      (acc, step) => ({
        ...acc,
        [step.id]: step.completed,
      }),
      {}
    )
    localStorage.setItem("mydispatch_wizard_progress", JSON.stringify(progressData))
  }, [])

  // ECHTE API-Integration: Prüfe Datenbank auf vorhandene Einträge
  const checkStepProgressFromAPI = useCallback(async () => {
    if (!companyId) {
      loadStepProgressFromStorage()
      return
    }

    setIsChecking(true)

    try {
      const supabase = createClient()

      // Parallele Abfragen für maximale Performance
      const [driversResult, vehiclesResult, bookingsResult, invoicesResult] = await Promise.all([
        // Prüfe ob mindestens 1 Fahrer existiert
        supabase
          .from("drivers")
          .select("id", { count: "exact", head: true })
          .eq("company_id", companyId)
          .limit(1),
        // Prüfe ob mindestens 1 Fahrzeug existiert
        supabase
          .from("vehicles")
          .select("id", { count: "exact", head: true })
          .eq("company_id", companyId)
          .limit(1),
        // Prüfe ob mindestens 1 Buchung existiert
        supabase
          .from("bookings")
          .select("id", { count: "exact", head: true })
          .eq("company_id", companyId)
          .limit(1),
        // Prüfe ob mindestens 1 Rechnung existiert
        supabase
          .from("invoices")
          .select("id", { count: "exact", head: true })
          .eq("company_id", companyId)
          .limit(1),
      ])

      // Aktualisiere Steps basierend auf API-Ergebnissen
      const updatedSteps = INITIAL_STEPS.map((step) => {
        switch (step.id) {
          case "driver":
            return { ...step, completed: (driversResult.count || 0) > 0 }
          case "vehicle":
            return { ...step, completed: (vehiclesResult.count || 0) > 0 }
          case "booking":
            return { ...step, completed: (bookingsResult.count || 0) > 0 }
          case "invoice":
            return { ...step, completed: (invoicesResult.count || 0) > 0 }
          default:
            return step
        }
      })

      setSteps(updatedSteps)
      saveStepProgress(updatedSteps)

      // Prüfe ob alle Schritte jetzt abgeschlossen sind
      const allNowCompleted = updatedSteps.every((s) => s.completed)
      if (allNowCompleted && !allCompleted) {
        toast.success("Glückwunsch! Alle ersten Schritte abgeschlossen! 🎉", {
          description: "Sie haben die wichtigsten Grundlagen für MyDispatch eingerichtet.",
          duration: 5000,
        })
      }
    } catch (error) {
      console.error("Error checking wizard progress from API:", error)
      // Fallback auf localStorage bei Fehler
      loadStepProgressFromStorage()
    } finally {
      setIsChecking(false)
    }
  }, [companyId, allCompleted, loadStepProgressFromStorage, saveStepProgress])

  // Initial und bei Änderungen API-Status prüfen
  useEffect(() => {
    if (!isVisible || !companyId) return

    // Sofort beim Anzeigen prüfen
    checkStepProgressFromAPI()

    // Alle 30 Sekunden automatisch aktualisieren wenn sichtbar
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        checkStepProgressFromAPI()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [isVisible, companyId, checkStepProgressFromAPI])

  // Bei Tab-Wechsel zurück zur Seite: Status aktualisieren
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isVisible && companyId) {
        checkStepProgressFromAPI()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [isVisible, companyId, checkStepProgressFromAPI])

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
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={checkStepProgressFromAPI}
                    disabled={isChecking}
                    className="h-8 w-8 p-0"
                    title="Status aktualisieren"
                  >
                    <RefreshCw className={`h-4 w-4 ${isChecking ? "animate-spin" : ""}`} />
                  </Button>
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
                  <Badge className="bg-success text-success-foreground">
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
                          ? "border-success/20 bg-success/5"
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

