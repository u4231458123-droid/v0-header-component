"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, User } from "lucide-react"
import { DriverDispatcherChat } from "@/components/communication/DriverDispatcherChat"

interface Driver {
  id: string
  first_name: string
  last_name: string
  email: string
  status: string
}

interface DriverChatPanelProps {
  companyId: string
  selectedDriverId?: string | null
  onSelectDriver?: (driverId: string) => void
}

export function DriverChatPanel({ companyId, selectedDriverId, onSelectDriver }: DriverChatPanelProps) {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [activeDriverId, setActiveDriverId] = useState<string | null>(selectedDriverId || null)
  const [dispatcherId, setDispatcherId] = useState<string | null>(null)
  const [dispatcherName, setDispatcherName] = useState<string>("")
  const supabase = createClient()

  useEffect(() => {
    loadDrivers()
    loadDispatcher()
  }, [companyId])

  const loadDrivers = async () => {
    try {
      const { data, error } = await supabase
        .from("drivers")
        .select("id, first_name, last_name, email, status")
        .eq("company_id", companyId)
        .order("last_name")

      if (data) {
        setDrivers(data)
      }
    } catch (error) {
      console.error("Error loading drivers:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadDispatcher = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setDispatcherId(user.id)
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", user.id)
          .maybeSingle()
        setDispatcherName(profile?.full_name || profile?.email || "Dispo")
      }
    } catch (error) {
      console.error("Error loading dispatcher:", error)
    }
  }

  const handleSelectDriver = (driverId: string) => {
    setActiveDriverId(driverId)
    onSelectDriver?.(driverId)
  }

  const activeDriver = drivers.find((d) => d.id === activeDriverId)

  if (loading) {
    return (
      <Card className="h-[600px]">
        <CardContent className="flex items-center justify-center h-full">
          <div className="animate-pulse text-muted-foreground">Lade Chat...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Fahrer-Kommunikation
        </CardTitle>
      </CardHeader>
      <div className="flex flex-1 overflow-hidden">
        {/* Driver List */}
        <div className="w-64 border-r bg-muted/30 overflow-y-auto">
          {drivers.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Keine Fahrer vorhanden</div>
          ) : (
            drivers.map((driver) => (
              <button
                key={driver.id}
                onClick={() => handleSelectDriver(driver.id)}
                className={`w-full p-3 text-left border-b border-border hover:bg-muted transition-colors ${
                  activeDriverId === driver.id ? "bg-muted" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {driver.first_name?.[0]}
                      {driver.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {driver.first_name} {driver.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{driver.email}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {activeDriverId && activeDriver && dispatcherId ? (
            <DriverDispatcherChat
              companyId={companyId}
              driverId={activeDriverId}
              dispatcherId={dispatcherId}
              dispatcherName={dispatcherName}
              driverName={`${activeDriver.first_name} ${activeDriver.last_name}`}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <User className="h-16 w-16 mb-3 opacity-20" />
              <p className="text-sm">Wählen Sie einen Fahrer aus</p>
              <p className="text-xs">um die Konversation zu starten</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
