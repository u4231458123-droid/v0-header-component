"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { format, differenceInMinutes } from "date-fns"
import { de } from "date-fns/locale"
import { DriverHelpBot } from "@/components/ai/DriverHelpBot"
import { safeNumber } from "@/lib/utils/safe-number"
import Link from "next/link"
import {
  Play,
  Square,
  Clock,
  MapPin,
  Phone,
  MessageSquare,
  Car,
  User,
  Calendar,
  Euro,
  Settings,
  FileText,
  Coffee,
  Navigation,
  CheckCircle2,
  XCircle,
  LogOut,
  Send,
} from "lucide-react"

interface DriverShift {
  id: string
  shift_start: string
  shift_end: string | null
  status: "scheduled" | "active" | "break" | "completed" | "cancelled"
  breaks: Array<{ start: string; end?: string; duration_minutes?: number }>
  total_bookings: number
  total_revenue: number
}

interface Booking {
  id: string
  pickup_address: string
  dropoff_address: string
  pickup_time: string
  status: string
  passengers: number
  price: number
  customer: {
    first_name: string
    last_name: string
    phone: string
  }
  notes?: string
}

interface Message {
  id: string
  content: string
  sender_type: string
  created_at: string
  read_at: string | null
}

interface CompletedBooking {
  id: string
  pickup_address: string
  dropoff_address: string
  pickup_time: string
  completed_at: string
  status: string
  passengers: number
  price: number
  customer: {
    first_name: string
    last_name: string
  } | null
}

interface Driver {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  avatar_url?: string
  company_id: string
  company?: {
    id: string
    name: string
    logo_url?: string
  }
}

export default function FahrerPortalPage() {
  const [supabase] = useState(() => createClient())
  const [loading, setLoading] = useState(true)
  const [driver, setDriver] = useState<Driver | null>(null)
  const [currentShift, setCurrentShift] = useState<DriverShift | null>(null)
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([])
  const [completedBookings, setCompletedBookings] = useState<CompletedBooking[]>([])
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [shiftTime, setShiftTime] = useState("00:00:00")
  const [breakTime, setBreakTime] = useState("00:00:00")
  const [activeTab, setActiveTab] = useState("fahrten")
  const [showStartShiftDialog, setShowStartShiftDialog] = useState(false)
  const [showStartBreakDialog, setShowStartBreakDialog] = useState(false)
  const [showEndBreakDialog, setShowEndBreakDialog] = useState(false)
  const [showEndShiftDialog, setShowEndShiftDialog] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)

  // Design-Tokens werden über Tailwind CSS-Klassen verwendet (bg-primary, text-primary)

  useEffect(() => {
    loadDriverData()
  }, [])

  useEffect(() => {
    if (!currentShift || currentShift.status === "completed") return

    const interval = setInterval(() => {
      const start = new Date(currentShift.shift_start)
      const now = new Date()
      const totalSeconds = Math.floor((now.getTime() - start.getTime()) / 1000)

      // Berechne Pausenzeit
      let totalBreakSeconds = 0
      currentShift.breaks.forEach((b) => {
        if (b.end) {
          totalBreakSeconds += (b.duration_minutes || 0) * 60
        } else {
          // Laufende Pause
          const breakStart = new Date(b.start)
          totalBreakSeconds += Math.floor((now.getTime() - breakStart.getTime()) / 1000)
        }
      })

      const workSeconds = totalSeconds - totalBreakSeconds
      setShiftTime(formatTime(workSeconds > 0 ? workSeconds : 0))
      setBreakTime(formatTime(totalBreakSeconds))
    }, 1000)

    return () => clearInterval(interval)
  }, [currentShift])

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  const loadDriverData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = "/login"
        return
      }

      // Lade Fahrer-Profil
      const { data: driverData } = await supabase
        .from("drivers")
        .select(
          `
          *,
          company:companies(id, name, logo_url)
        `,
        )
        .eq("user_id", user.id)
        .single()

      if (!driverData) {
        setLoading(false)
        return
      }

      setDriver(driverData)

      // Lade aktive Schicht
      const { data: shiftData } = await supabase
        .from("driver_shifts")
        .select("*")
        .eq("driver_id", driverData.id)
        .in("status", ["active", "break", "scheduled"])
        .order("shift_start", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (shiftData) {
        setCurrentShift(shiftData)
      }

      // Lade anstehende Buchungen
      const { data: bookingsData } = await supabase
        .from("bookings")
        .select(
          `
          *,
          customer:customers(first_name, last_name, phone)
        `,
        )
        .eq("driver_id", driverData.id)
        .in("status", ["assigned", "pending", "in_progress"])
        .order("pickup_time", { ascending: true })

      if (bookingsData) {
        setPendingBookings(bookingsData)
        interface Booking {
          status?: string
        }
        const active = bookingsData.find((b: Booking) => b.status === "in_progress")
        if (active) setActiveBooking(active)
      }

      // Lade Nachrichten
      const { data: messagesData } = await supabase
        .from("communication_log")
        .select("*")
        .or(`sender_id.eq.${driverData.id},recipient_id.eq.${driverData.id}`)
        .order("created_at", { ascending: false })
        .limit(50)

      if (messagesData) {
        setMessages(messagesData)
      }
    } catch (error) {
      console.error("Error loading driver data:", error)
    } finally {
      setLoading(false)
    }
  }

  const startShift = async () => {
    if (!driver) return

    try {
      const { data, error } = await supabase
        .from("driver_shifts")
        .insert({
          driver_id: driver.id,
          company_id: driver.company_id,
          shift_start: new Date().toISOString(),
          status: "active",
          breaks: [],
          total_bookings: 0,
          total_revenue: 0,
        })
        .select()
        .single()

      if (error) throw error

      if (data) {
        setCurrentShift(data)
        toast.success("Schicht erfolgreich gestartet", {
          description: "Sie können jetzt Fahrten annehmen.",
          duration: 4000,
        })
      }
    } catch (error: any) {
      console.error("Error starting shift:", error)
      toast.error("Fehler beim Starten der Schicht", {
        description: "Bitte versuchen Sie es erneut.",
        duration: 5000,
      })
    } finally {
      setShowStartShiftDialog(false)
    }
  }

  const startBreak = async () => {
    if (!currentShift) return

    try {
      const newBreaks = [...currentShift.breaks, { start: new Date().toISOString() }]

      const { data, error } = await supabase
        .from("driver_shifts")
        .update({
          status: "break",
          breaks: newBreaks,
        })
        .eq("id", currentShift.id)
        .select()
        .single()

      if (error) throw error

      if (data) {
        setCurrentShift(data)
        toast.success("Pause gestartet", {
          description: "Vergessen Sie nicht, die Pause zu beenden.",
          duration: 4000,
        })
      }
    } catch (error: any) {
      console.error("Error starting break:", error)
      toast.error("Fehler beim Starten der Pause", {
        description: "Bitte versuchen Sie es erneut.",
        duration: 5000,
      })
    } finally {
      setShowStartBreakDialog(false)
    }
  }

  const endBreak = async () => {
    if (!currentShift) return

    try {
      const newBreaks = currentShift.breaks.map((b, i) => {
        if (i === currentShift.breaks.length - 1 && !b.end) {
          const start = new Date(b.start)
          const end = new Date()
          return {
            ...b,
            end: end.toISOString(),
            duration_minutes: differenceInMinutes(end, start),
          }
        }
        return b
      })

      const { data, error } = await supabase
        .from("driver_shifts")
        .update({
          status: "active",
          breaks: newBreaks,
        })
        .eq("id", currentShift.id)
        .select()
        .single()

      if (error) throw error

      if (data) {
        setCurrentShift(data)
        toast.success("Pause beendet", {
          description: "Willkommen zurück! Sie können wieder Fahrten annehmen.",
          duration: 4000,
        })
      }
    } catch (error: any) {
      console.error("Error ending break:", error)
      toast.error("Fehler beim Beenden der Pause", {
        description: "Bitte versuchen Sie es erneut.",
        duration: 5000,
      })
    } finally {
      setShowEndBreakDialog(false)
    }
  }

  const endShift = async () => {
    if (!currentShift) return

    try {
      let finalBreaks = currentShift.breaks
      if (currentShift.status === "break") {
        finalBreaks = currentShift.breaks.map((b, i) => {
          if (i === currentShift.breaks.length - 1 && !b.end) {
            const start = new Date(b.start)
            const end = new Date()
            return {
              ...b,
              end: end.toISOString(),
              duration_minutes: differenceInMinutes(end, start),
            }
          }
          return b
        })
      }

      const { data, error } = await supabase
        .from("driver_shifts")
        .update({
          status: "completed",
          shift_end: new Date().toISOString(),
          breaks: finalBreaks,
          total_bookings: pendingBookings.filter((b) => b.status === "completed").length,
        })
        .eq("id", currentShift.id)
        .select()
        .single()

      if (error) throw error

      if (data) {
        setCurrentShift(null)
        toast.success("Schicht erfolgreich beendet", {
          description: "Ihre Arbeitszeit wurde protokolliert. Gute Erholung!",
          duration: 4000,
        })
      }
    } catch (error: any) {
      console.error("Error ending shift:", error)
      toast.error("Fehler beim Beenden der Schicht", {
        description: "Bitte versuchen Sie es erneut.",
        duration: 5000,
      })
    } finally {
      setShowEndShiftDialog(false)
    }
  }

  const acceptBooking = async (bookingId: string) => {
    // Optimistic UI: Sofortige Aktualisierung
    const bookingToAccept = pendingBookings.find((b) => b.id === bookingId)
    if (bookingToAccept) {
      setPendingBookings((prev) => prev.filter((b) => b.id !== bookingId))
      setActiveBooking({ ...bookingToAccept, status: "in_progress" })
      toast.success("Fahrt angenommen", {
        description: "Navigation wird geladen...",
        duration: 3000,
      })
    }

    const { error } = await supabase.from("bookings").update({ status: "in_progress" }).eq("id", bookingId)

    if (error) {
      // Rollback bei Fehler
      if (bookingToAccept) {
        setPendingBookings((prev) => [...prev, bookingToAccept])
        setActiveBooking(null)
      }
      toast.error("Fehler beim Annehmen der Fahrt", {
        description: "Bitte versuchen Sie es erneut.",
        duration: 5000,
      })
    }
  }

  const declineBooking = async (bookingId: string) => {
    // Optimistic UI: Sofortige Entfernung aus der Liste
    const bookingToDecline = pendingBookings.find((b) => b.id === bookingId)
    setPendingBookings((prev) => prev.filter((b) => b.id !== bookingId))
    toast.success("Fahrt abgelehnt", {
      description: "Die Fahrt wird einem anderen Fahrer zugewiesen.",
      duration: 3000,
    })

    const { error } = await supabase
      .from("bookings")
      .update({ status: "cancelled", driver_id: null })
      .eq("id", bookingId)

    if (error) {
      // Rollback bei Fehler
      if (bookingToDecline) {
        setPendingBookings((prev) => [...prev, bookingToDecline])
      }
      toast.error("Fehler beim Ablehnen der Fahrt", {
        description: "Bitte versuchen Sie es erneut.",
        duration: 5000,
      })
    }
  }

  const completeBooking = async (bookingId: string) => {
    // Optimistic UI: Sofortige Status-Änderung
    const previousActiveBooking = activeBooking
    setActiveBooking(null)
    toast.success("Fahrt abgeschlossen", {
      description: "Vielen Dank! Die Fahrt wurde erfolgreich beendet.",
      duration: 4000,
    })

    const { error } = await supabase
      .from("bookings")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", bookingId)

    if (error) {
      // Rollback bei Fehler
      setActiveBooking(previousActiveBooking)
      toast.error("Fehler beim Abschließen der Fahrt", {
        description: "Bitte versuchen Sie es erneut.",
        duration: 5000,
      })
    } else {
      // Daten neu laden für Fahrtenverlauf
      loadDriverData()
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !driver) return

    const { error } = await supabase.from("communication_log").insert({
      company_id: driver.company_id,
      sender_type: "driver",
      sender_id: driver.id,
      recipient_type: "dispatcher",
      message_type: "text",
      content: newMessage,
    })

    if (!error) {
      setNewMessage("")
      loadDriverData()
    }
  }

  // Lade abgeschlossene Fahrten für den Verlauf-Tab
  const loadCompletedBookings = async () => {
    if (!driver) return

    setLoadingHistory(true)
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id,
          pickup_address,
          dropoff_address,
          pickup_time,
          completed_at,
          status,
          passengers,
          price,
          customer:customers(first_name, last_name)
        `)
        .eq("driver_id", driver.id)
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(50)

      if (!error && data) {
        setCompletedBookings(data as CompletedBooking[])
      }
    } catch (error) {
      console.error("Error loading completed bookings:", error)
    } finally {
      setLoadingHistory(false)
    }
  }

  // Lade Fahrtenverlauf wenn Tab gewechselt wird
  useEffect(() => {
    if (activeTab === "verlauf" && driver && completedBookings.length === 0) {
      loadCompletedBookings()
    }
  }, [activeTab, driver])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/auth/login"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-success hover:bg-success">Abgeschlossen</Badge>
      case "in_progress":
        return <Badge variant="default" className="bg-primary hover:bg-primary/90">In Fahrt</Badge>
      case "assigned":
        return <Badge variant="secondary">Zugewiesen</Badge>
      case "pending":
        return <Badge variant="secondary">Ausstehend</Badge>
      case "cancelled":
        return <Badge variant="destructive">Storniert</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!driver) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Kein Fahrer-Profil gefunden</CardTitle>
            <CardDescription>
              Sie sind nicht als Fahrer registriert. Bitte wenden Sie sich an Ihren Administrator.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Statistiken berechnen
  const completedToday = pendingBookings.filter((b) => b.status === "completed").length
  const totalRevenue = pendingBookings
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + (b.price || 0), 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Header - wie Kundenportal */}
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {driver.company?.logo_url ? (
                <img
                  src={driver.company.logo_url || "/placeholder.svg"}
                  alt={driver.company.name}
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center text-primary-foreground font-bold bg-primary"
                >
                  {driver.company?.name?.charAt(0) || "F"}
                </div>
              )}
              <div>
                <p className="font-semibold text-foreground">
                  {driver.first_name} {driver.last_name}
                </p>
                <p className="text-xs text-muted-foreground">Fahrer-Portal • {driver.company?.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge
                variant={
                  currentShift?.status === "active"
                    ? "default"
                    : currentShift?.status === "break"
                      ? "secondary"
                      : "outline"
                }
                className={
                  currentShift?.status === "active"
                    ? "bg-success"
                    : currentShift?.status === "break"
                      ? "bg-warning"
                      : ""
                }
              >
                {currentShift?.status === "active"
                  ? "Im Dienst"
                  : currentShift?.status === "break"
                    ? "Pause"
                    : "Offline"}
              </Badge>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Einstellungen</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    <Link href="/fahrer-portal/dokumente">
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <FileText className="mr-2 h-4 w-4" />
                        Meine Dokumente
                      </Button>
                    </Link>
                    <Link href="/fahrer-portal/profil">
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <User className="mr-2 h-4 w-4" />
                        Profil bearbeiten
                      </Button>
                    </Link>
                    <Separator />
                    <Button
                      variant="outline"
                      className="w-full justify-start text-destructive bg-transparent"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Abmelden
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Willkommens-Bereich */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Hallo, {driver.first_name}!</h1>
          <p className="text-muted-foreground">Willkommen in Ihrem Fahrer-Portal</p>
        </div>

        {/* Schicht-Steuerung Card */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Schicht-Steuerung
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!currentShift || currentShift.status === "completed" ? (
              <>
                <Button
                  onClick={() => setShowStartShiftDialog(true)}
                  className="w-full h-14 text-lg text-primary-foreground bg-primary hover:bg-primary/90"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Schicht starten
                </Button>
                <AlertDialog open={showStartShiftDialog} onOpenChange={setShowStartShiftDialog}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Schicht starten?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Möchten Sie wirklich Ihre Schicht jetzt starten? Die Schichtzeit wird ab sofort gezählt.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                      <AlertDialogAction onClick={startShift} className="bg-primary hover:bg-primary/90">
                        Schicht starten
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            ) : (
              <div className="space-y-4">
                {/* Timer Display */}
                <div className="grid grid-cols-2 gap-5">
                  <div className="bg-muted rounded-xl p-4 text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Schichtzeit</p>
                    <p className="text-3xl font-mono font-bold text-foreground">{shiftTime}</p>
                  </div>
                  <div className="bg-muted rounded-xl p-4 text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Pausenzeit</p>
                    <p className="text-3xl font-mono font-bold text-muted-foreground">{breakTime}</p>
                  </div>
                </div>

                {/* Schicht-Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  {currentShift.status === "active" ? (
                    <>
                      <Button onClick={() => setShowStartBreakDialog(true)} variant="secondary" className="h-12">
                        <Coffee className="mr-2 h-4 w-4" />
                        Pause starten
                      </Button>
                      <AlertDialog open={showStartBreakDialog} onOpenChange={setShowStartBreakDialog}>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Pause starten?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Möchten Sie wirklich eine Pause starten? Die Pausenzeit wird ab sofort gezählt.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                            <AlertDialogAction onClick={startBreak}>Pause starten</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  ) : (
                    <>
                      <Button onClick={() => setShowEndBreakDialog(true)} variant="secondary" className="h-12">
                        <Play className="mr-2 h-4 w-4" />
                        Pause beenden
                      </Button>
                      <AlertDialog open={showEndBreakDialog} onOpenChange={setShowEndBreakDialog}>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Pause beenden?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Möchten Sie die Pause jetzt beenden und mit der Schicht fortfahren?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                            <AlertDialogAction onClick={endBreak}>Pause beenden</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                  <>
                    <Button onClick={() => setShowEndShiftDialog(true)} variant="destructive" className="h-12">
                      <Square className="mr-2 h-4 w-4" />
                      Schicht beenden
                    </Button>
                    <AlertDialog open={showEndShiftDialog} onOpenChange={setShowEndShiftDialog}>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Schicht beenden?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Möchten Sie wirklich Ihre Schicht jetzt beenden? Diese Aktion kann nicht rückgängig gemacht
                            werden. Die Schicht wird als abgeschlossen markiert.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                          <AlertDialogAction onClick={endShift} className="bg-destructive hover:bg-destructive/90">
                            Schicht beenden
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistik-Karten - wie Kundenportal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-5">
                <div
                  className="h-12 w-12 rounded-full flex items-center justify-center text-primary-foreground bg-primary"
                >
                  <Car className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingBookings.length}</p>
                  <p className="text-sm text-muted-foreground">Anstehende Fahrten</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-5">
                <div
                  className="h-12 w-12 rounded-full flex items-center justify-center text-primary-foreground bg-primary"
                >
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{currentShift?.total_bookings || 0}</p>
                  <p className="text-sm text-muted-foreground">Heute abgeschlossen</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-5">
                <div
                  className="h-12 w-12 rounded-full flex items-center justify-center text-primary-foreground bg-primary"
                >
                  <Euro className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{safeNumber(currentShift?.total_revenue).toFixed(2)} EUR</p>
                  <p className="text-sm text-muted-foreground">Heutiger Umsatz</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Aktive Fahrt */}
        {activeBooking && (
          <Card className="mb-6 border-2 border-primary">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-primary animate-pulse" />
                  Aktive Fahrt
                </CardTitle>
                <Badge className="bg-primary">In Fahrt</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-success mt-1.5"></div>
                  <div>
                    <p className="text-xs text-muted-foreground">Abholung</p>
                    <p className="font-medium">{activeBooking.pickup_address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-destructive mt-1.5"></div>
                  <div>
                    <p className="text-xs text-muted-foreground">Ziel</p>
                    <p className="font-medium">{activeBooking.dropoff_address}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {activeBooking.customer?.first_name} {activeBooking.customer?.last_name}
                    </span>
                  </div>
                  {activeBooking.customer?.phone && (
                    <a href={`tel:${activeBooking.customer.phone}`}>
                      <Button variant="outline" size="sm">
                        <Phone className="h-4 w-4 mr-1" />
                        Anrufen
                      </Button>
                    </a>
                  )}
                </div>
                <Button onClick={() => completeBooking(activeBooking.id)} className="bg-success hover:bg-success">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Fahrt abschliessen
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs - wie Kundenportal */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="fahrten">Anstehende Fahrten</TabsTrigger>
            <TabsTrigger value="zentrale">Zentrale</TabsTrigger>
            <TabsTrigger value="verlauf">Fahrtenverlauf</TabsTrigger>
          </TabsList>

          {/* Anstehende Fahrten Tab */}
          <TabsContent value="fahrten">
            <Card>
              <CardHeader>
                <CardTitle>Anstehende Fahrten</CardTitle>
                <CardDescription>Ihre zugewiesenen Auftraege</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingBookings.filter((b) => b.status !== "in_progress").length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Car className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>Keine anstehenden Fahrten</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingBookings
                      .filter((b) => b.status !== "in_progress")
                      .map((booking) => (
                        <div key={booking.id} className="border rounded-xl p-4 hover:bg-muted transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {format(new Date(booking.pickup_time), "dd. MMMM yyyy", { locale: de })}
                              </span>
                              <Clock className="h-4 w-4 text-muted-foreground ml-2" />
                              <span>{format(new Date(booking.pickup_time), "HH:mm", { locale: de })} Uhr</span>
                            </div>
                            {getStatusBadge(booking.status)}
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-success mt-0.5" />
                              <span className="text-sm">{booking.pickup_address}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-destructive mt-0.5" />
                              <span className="text-sm">{booking.dropoff_address}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t">
                            <div className="flex items-center gap-5 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                <span>
                                  {booking.customer?.first_name} {booking.customer?.last_name}
                                </span>
                              </div>
                              {booking.passengers && <span>{booking.passengers} Passagier(e)</span>}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive border-destructive hover:bg-destructive/10 bg-transparent"
                                onClick={() => declineBooking(booking.id)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Ablehnen
                              </Button>
                              <Button
                                size="sm"
                                className="text-primary-foreground bg-primary hover:bg-primary/90"
                                onClick={() => acceptBooking(booking.id)}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Annehmen
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Zentrale Tab */}
          <TabsContent value="zentrale">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Zentrale
                </CardTitle>
                <CardDescription>Kommunikation mit der Disposition</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] mb-4 border rounded-xl p-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
                      <p>Keine Nachrichten</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender_type === "driver" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-xl p-3 ${
                              message.sender_type === "driver"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {format(new Date(message.created_at), "HH:mm", { locale: de })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Nachricht an die Zentrale..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="min-h-[44px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                  />
                  <Button onClick={sendMessage} className="text-primary-foreground bg-primary hover:bg-primary/90">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Verlauf Tab */}
          <TabsContent value="verlauf">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Fahrtenverlauf</CardTitle>
                  <CardDescription>Ihre abgeschlossenen Fahrten</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadCompletedBookings}
                  disabled={loadingHistory}
                  className="bg-transparent"
                >
                  {loadingHistory ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  ) : (
                    "Aktualisieren"
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                {loadingHistory ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : completedBookings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Car className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>Keine abgeschlossenen Fahrten</p>
                    <p className="text-sm mt-1">Hier erscheinen Ihre abgeschlossenen Aufträge</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {completedBookings.map((booking) => (
                      <div key={booking.id} className="border rounded-xl p-4 bg-muted/30">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {format(new Date(booking.pickup_time), "dd. MMMM yyyy", { locale: de })}
                            </span>
                            <Clock className="h-4 w-4 text-muted-foreground ml-2" />
                            <span>{format(new Date(booking.pickup_time), "HH:mm", { locale: de })} Uhr</span>
                          </div>
                          <Badge className="bg-success hover:bg-success">Abgeschlossen</Badge>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-success mt-0.5" />
                            <span className="text-sm">{booking.pickup_address}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-destructive mt-0.5" />
                            <span className="text-sm">{booking.dropoff_address}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="flex items-center gap-5 text-sm text-muted-foreground">
                            {booking.customer && (
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                <span>
                                  {booking.customer.first_name} {booking.customer.last_name}
                                </span>
                              </div>
                            )}
                            {booking.passengers && <span>{booking.passengers} Passagier(e)</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">
                              {safeNumber(booking.price).toFixed(2)} EUR
                            </span>
                          </div>
                        </div>

                        {booking.completed_at && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Abgeschlossen: {format(new Date(booking.completed_at), "dd.MM.yyyy HH:mm", { locale: de })} Uhr
                          </p>
                        )}
                      </div>
                    ))}

                    {completedBookings.length > 0 && (
                      <div className="text-center pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          {completedBookings.length} abgeschlossene {completedBookings.length === 1 ? "Fahrt" : "Fahrten"} angezeigt
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Hilfe-Bereich - wie Kundenportal */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-5">
              <div>
                <h3 className="font-semibold">Hilfe benoetigt?</h3>
                <p className="text-sm text-muted-foreground">Kontaktieren Sie die Zentrale bei Fragen</p>
              </div>
              <div className="flex items-center gap-5">
                <Button variant="outline" onClick={() => setActiveTab("zentrale")}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Nachricht senden
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer - wie Kundenportal */}
      <footer className="bg-primary text-primary-foreground mt-8 py-6">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-primary-foreground/70">
          <p>
            &copy; {new Date().getFullYear()} {driver.company?.name}. Alle Rechte vorbehalten.
          </p>
          <div className="flex items-center justify-center gap-5 mt-2">
            <Link href="/impressum" className="hover:text-primary-foreground transition-colors">
              Impressum
            </Link>
            <Link href="/datenschutz" className="hover:text-primary-foreground transition-colors">
              Datenschutz
            </Link>
          </div>
        </div>
      </footer>

      {/* AI Help Bot */}
      <DriverHelpBot />
    </div>
  )
}
