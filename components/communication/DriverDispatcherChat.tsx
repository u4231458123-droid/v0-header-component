"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { ChatWidget } from "./ChatWidget"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle } from "lucide-react"

interface DriverDispatcherChatProps {
  companyId: string
  driverId: string
  dispatcherId: string
  dispatcherName?: string
  driverName?: string
}

export function DriverDispatcherChat({
  companyId,
  driverId,
  dispatcherId,
  driverName,
  dispatcherName,
}: DriverDispatcherChatProps) {
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [driverShiftActive, setDriverShiftActive] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadConversation()
    checkDriverShift()
  }, [companyId, driverId, dispatcherId])

  const loadConversation = async () => {
    try {
      // Lade driver user_id
      const { data: driver } = await supabase
        .from("drivers")
        .select("user_id")
        .eq("id", driverId)
        .single()

      if (!driver?.user_id) {
        throw new Error("Driver user_id not found")
      }

      // Verwende RPC-Funktion get_or_create_conversation
      const { data: convId, error } = await supabase.rpc("get_or_create_conversation", {
        p_company_id: companyId,
        p_participant_1_type: "driver",
        p_participant_1_id: driver.user_id,
        p_participant_2_type: "dispatcher",
        p_participant_2_id: dispatcherId,
        p_booking_id: null,
      })

      if (error) throw error
      if (convId) setConversationId(convId)
    } catch (error) {
      console.error("Error loading conversation:", error)
    } finally {
      setLoading(false)
    }
  }

  const checkDriverShift = async () => {
    try {
      const { data: shift } = await supabase
        .from("driver_shifts")
        .select("status, shift_start, shift_end")
        .eq("driver_id", driverId)
        .in("status", ["active", "break"])
        .order("shift_start", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (shift) {
        const now = new Date()
        const shiftStart = new Date(shift.shift_start)
        const shiftEnd = shift.shift_end ? new Date(shift.shift_end) : null

        if (shiftStart <= now && (!shiftEnd || shiftEnd >= now)) {
          setDriverShiftActive(true)
        }
      }
    } catch (error) {
      console.error("Error checking driver shift:", error)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[600px]">
          <div className="animate-pulse text-muted-foreground">Lade Chat...</div>
        </CardContent>
      </Card>
    )
  }

  if (!conversationId) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[600px]">
          <div className="text-muted-foreground">Fehler beim Laden des Chats</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {!driverShiftActive && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="h-5 w-5 text-warning" />
            <div className="flex-1">
              <p className="text-sm font-medium">Fahrer ist nicht im Dienst</p>
              <p className="text-xs text-muted-foreground">
                Die Kommunikation ist nur möglich, wenn der Fahrer eine aktive Schicht hat.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <ChatWidget
        conversationId={conversationId}
        companyId={companyId}
        participant1Type="driver"
        participant1Id={driverId}
        participant2Type="dispatcher"
        participant2Id={dispatcherId}
        currentUserId={dispatcherId}
        currentUserType="dispatcher"
        currentUserName={dispatcherName}
        driverShiftActive={driverShiftActive}
        bookingId={null}
      />
    </div>
  )
}

