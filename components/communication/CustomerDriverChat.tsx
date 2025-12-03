"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { ChatWidget } from "./ChatWidget"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Clock } from "lucide-react"
import { differenceInMinutes } from "date-fns"

interface CustomerDriverChatProps {
  companyId: string
  customerId: string
  driverId: string
  bookingId: string
  bookingPickupTime: string
  bookingStatus: string
  customerName?: string
  driverName?: string
}

export function CustomerDriverChat({
  companyId,
  customerId,
  driverId,
  bookingId,
  bookingPickupTime,
  bookingStatus,
  customerName,
  driverName,
}: CustomerDriverChatProps) {
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [canChat, setCanChat] = useState(false)
  const [timeWindow, setTimeWindow] = useState<{ before: number; after: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadConversation()
    checkTimeWindow()
  }, [companyId, customerId, driverId, bookingId, bookingPickupTime, bookingStatus])

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
        p_participant_1_type: "customer",
        p_participant_1_id: customerId,
        p_participant_2_type: "driver",
        p_participant_2_id: driver.user_id,
        p_booking_id: bookingId,
      })

      if (error) throw error
      if (convId) setConversationId(convId)
    } catch (error) {
      console.error("Error loading conversation:", error)
    } finally {
      setLoading(false)
    }
  }

  const checkTimeWindow = () => {
    if (!bookingPickupTime) {
      setCanChat(false)
      return
    }

    const now = new Date()
    const pickupTime = new Date(bookingPickupTime)
    const minutesDiff = differenceInMinutes(pickupTime, now)

    // 30 Minuten vor Fahrt
    if (minutesDiff <= 30 && minutesDiff >= 0) {
      setCanChat(true)
      setTimeWindow({ before: minutesDiff, after: 0 })
      return
    }

    // Während Fahrt
    if (bookingStatus === "in_progress") {
      setCanChat(true)
      setTimeWindow({ before: 0, after: 0 })
      return
    }

    // Nach Fahrt (30 Minuten nach Fahrt)
    if (bookingStatus === "completed") {
      const minutesAfter = differenceInMinutes(now, pickupTime)
      if (minutesAfter <= 30) {
        setCanChat(true)
        setTimeWindow({ before: 0, after: minutesAfter })
        return
      }
    }

    setCanChat(false)
    setTimeWindow(null)
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
      {!canChat && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="h-5 w-5 text-warning" />
            <div className="flex-1">
              <p className="text-sm font-medium">Chat nicht verfügbar</p>
              <p className="text-xs text-muted-foreground">
                Die Kommunikation ist nur 30 Minuten vor und nach der Fahrt möglich.
                {timeWindow === null && bookingPickupTime && (
                  <span>
                    {" "}
                    Abholzeit: {new Date(bookingPickupTime).toLocaleString("de-DE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {canChat && timeWindow && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium">Chat verfügbar</p>
              <p className="text-xs text-muted-foreground">
                {timeWindow.before > 0
                  ? `Noch ${timeWindow.before} Minuten bis zur Abholung`
                  : timeWindow.after > 0
                    ? `Fahrt abgeschlossen - Chat noch ${30 - timeWindow.after} Minuten verfügbar`
                    : "Fahrt läuft - Chat verfügbar"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <ChatWidget
        conversationId={conversationId}
        companyId={companyId}
        participant1Type="customer"
        participant1Id={customerId}
        participant2Type="driver"
        participant2Id={driverId}
        bookingId={bookingId}
        bookingPickupTime={bookingPickupTime}
        bookingStatus={bookingStatus}
        currentUserId={customerId}
        currentUserType="customer"
        currentUserName={customerName}
      />
    </div>
  )
}

