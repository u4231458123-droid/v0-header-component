"use client"

import { DashboardTour } from "./DashboardTour"
import { FirstStepsWizard } from "./FirstStepsWizard"
import { toast } from "sonner"

interface DashboardTourWrapperProps {
  companyId: string | null
}

export function DashboardTourWrapper({ companyId }: DashboardTourWrapperProps) {
  const handleTourComplete = () => {
    toast.success("🎉 Perfekt! Sie kennen jetzt die wichtigsten Funktionen.", {
      description: "Starten Sie jetzt mit Ihren ersten Schritten.",
      duration: 5000,
    })
  }

  const handleWizardComplete = () => {
    toast.success("🎉 Glückwunsch! Sie haben alle ersten Schritte abgeschlossen!", {
      description: "Ihr System ist jetzt startklar für den produktiven Einsatz.",
      duration: 5000,
    })
  }

  return (
    <>
      <DashboardTour onComplete={handleTourComplete} />
      <FirstStepsWizard companyId={companyId} onComplete={handleWizardComplete} />
    </>
  )
}

