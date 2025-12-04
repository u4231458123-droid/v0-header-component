"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CreateBookingDialog } from "@/components/bookings/CreateBookingDialog"

interface DashboardHeaderProps {
  userName: string
  companyId: string | null
  customers?: any[]
  drivers?: any[]
}

export function DashboardHeader({ userName, companyId, customers = [], drivers = [] }: DashboardHeaderProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  return (
    <>
      {/* Header mit mehr Abstand zwischen Elementen */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Willkommen, {userName}</p>
        </div>
        <div className="flex items-center gap-4" data-tour="quick-actions">
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-smooth shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Neuer Auftrag
          </Button>
        </div>
      </div>

      {/* CreateBookingDialog direkt im Header */}
      <CreateBookingDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        customers={customers}
        drivers={drivers}
        companyId={companyId}
      />
    </>
  )
}
