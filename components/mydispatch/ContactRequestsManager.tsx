"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import {
  MessageSquare,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Eye,
  Edit,
  Building2,
  Calendar,
} from "lucide-react"
import { format } from "date-fns"
import { de } from "date-fns/locale"

interface ContactRequest {
  id: string
  name: string
  email: string
  subject: string
  message: string
  company?: string
  phone?: string
  type: string
  status: string
  created_at: string
  updated_at?: string
  response?: string
  responded_at?: string
  responded_by?: string
}

interface ContactRequestsManagerProps {
  contactRequests: ContactRequest[]
}

export function ContactRequestsManager({ contactRequests: initialRequests }: ContactRequestsManagerProps) {
  const [contactRequests, setContactRequests] = useState(initialRequests)
  const [selectedRequest, setSelectedRequest] = useState<ContactRequest | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isResponding, setIsResponding] = useState(false)
  const [responseText, setResponseText] = useState("")
  const [responseSubject, setResponseSubject] = useState("")
  const [filter, setFilter] = useState<"all" | "new" | "in_progress" | "resolved">("all")
  const supabase = createClient()

  const filteredRequests = contactRequests.filter((req) => {
    if (filter === "all") return true
    if (filter === "new") return req.status === "new"
    if (filter === "in_progress") return req.status === "in_progress"
    if (filter === "resolved") return req.status === "resolved"
    return true
  })

  const handleViewRequest = (request: ContactRequest) => {
    setSelectedRequest(request)
    setResponseSubject(`Re: ${request.subject}`)
    setIsDialogOpen(true)
  }

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("contact_requests")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId)

      if (error) throw error

      setContactRequests((prev) =>
        prev.map((req) => (req.id === requestId ? { ...req, status: newStatus, updated_at: new Date().toISOString() } : req)),
      )

      toast.success("Status erfolgreich aktualisiert", {
        description: "Der Status der Kontaktanfrage wurde geändert.",
        duration: 4000,
      })
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error("Fehler beim Aktualisieren des Status", {
        description: "Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.",
        duration: 5000,
      })
    }
  }

  const handleSendResponse = async () => {
    if (!selectedRequest || !responseText.trim()) {
      toast.error("Bitte geben Sie eine Antwort ein", {
        description: "Die Antwort ist erforderlich, um auf die Kontaktanfrage zu antworten.",
        duration: 5000,
      })
      return
    }

    setIsResponding(true)

    try {
      // Update request with response
      const { error: updateError } = await supabase
        .from("contact_requests")
        .update({
          status: "resolved",
          response: responseText,
          responded_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedRequest.id)

      if (updateError) throw updateError

      // Send email response (via API route)
      const { error: emailError } = await fetch("/api/contact/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          to: selectedRequest.email,
          subject: responseSubject || `Re: ${selectedRequest.subject}`,
          message: responseText,
        }),
      }).then((res) => res.json())

      if (emailError) {
        console.warn("Email sending failed, but request was updated:", emailError)
      }

      // Update local state
      setContactRequests((prev) =>
        prev.map((req) =>
          req.id === selectedRequest.id
            ? {
                ...req,
                status: "resolved",
                response: responseText,
                responded_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }
            : req,
        ),
      )

      toast.success("Antwort erfolgreich gesendet")
      setIsDialogOpen(false)
      setResponseText("")
      setResponseSubject("")
      setSelectedRequest(null)
    } catch (error) {
      console.error("Error sending response:", error)
      toast.error("Fehler beim Senden der Antwort")
    } finally {
      setIsResponding(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return (
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning">
            <Clock className="h-3 w-3 mr-1" />
            Neu
          </Badge>
        )
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-info/10 text-info border-info">
            <Edit className="h-3 w-3 mr-1" />
            In Bearbeitung
          </Badge>
        )
      case "resolved":
        return (
          <Badge variant="outline" className="bg-success/10 text-success border-success">
            <CheckCircle className="h-3 w-3 mr-1" />
            Erledigt
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "general":
        return "Allgemein"
      case "support":
        return "Support"
      case "demo":
        return "Demo-Anfrage"
      case "partnership":
        return "Partnerschaft"
      case "tenant_contact":
        return "Kunden-Kontakt"
      default:
        return type
    }
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList>
          <TabsTrigger value="all">Alle ({contactRequests.length})</TabsTrigger>
          <TabsTrigger value="new">
            Neu ({contactRequests.filter((r) => r.status === "new").length})
          </TabsTrigger>
          <TabsTrigger value="in_progress">
            In Bearbeitung ({contactRequests.filter((r) => r.status === "in_progress").length})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Erledigt ({contactRequests.filter((r) => r.status === "resolved").length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Requests List */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>Keine Anfragen gefunden</p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id} className="border-border hover:border-primary/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-5">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-foreground">{request.subject}</h3>
                      {getStatusBadge(request.status)}
                      <Badge variant="outline" className="text-xs">
                        {getTypeLabel(request.type)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-5 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {request.email}
                      </div>
                      {request.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {request.phone}
                        </div>
                      )}
                      {request.company && (
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          {request.company}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(request.created_at), "dd.MM.yyyy HH:mm", { locale: de })}
                      </div>
                    </div>
                    <p className="text-sm text-foreground line-clamp-2">{request.message}</p>
                    {request.response && (
                      <div className="mt-2 p-3 rounded-xl bg-muted border border-border">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Antwort:</p>
                        <p className="text-sm text-foreground">{request.response}</p>
                        {request.responded_at && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Beantwortet am: {format(new Date(request.responded_at), "dd.MM.yyyy HH:mm", { locale: de })}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewRequest(request)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Details
                    </Button>
                    {request.status !== "resolved" && (
                      <Select
                        value={request.status}
                        onValueChange={(value) => handleUpdateStatus(request.id, value)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">Neu</SelectItem>
                          <SelectItem value="in_progress">In Bearbeitung</SelectItem>
                          <SelectItem value="resolved">Erledigt</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Response Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Anfrage bearbeiten & beantworten</DialogTitle>
            <DialogDescription>
              {selectedRequest && (
                <>
                  Von: {selectedRequest.name} ({selectedRequest.email})
                  {selectedRequest.phone && ` • ${selectedRequest.phone}`}
                  {selectedRequest.company && ` • ${selectedRequest.company}`}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              {/* Original Message */}
              <div className="p-4 rounded-xl bg-muted border border-border">
                <Label className="text-xs font-medium text-muted-foreground mb-2 block">Original-Nachricht:</Label>
                <p className="text-sm text-foreground whitespace-pre-wrap">{selectedRequest.message}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Erhalten am: {format(new Date(selectedRequest.created_at), "dd.MM.yyyy HH:mm", { locale: de })}
                </p>
              </div>

              {/* Response Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="response-subject">Betreff *</Label>
                  <Input
                    id="response-subject"
                    value={responseSubject}
                    onChange={(e) => setResponseSubject(e.target.value)}
                    placeholder="Re: Ihre Anfrage"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="response-text">Antwort *</Label>
                  <Textarea
                    id="response-text"
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Ihre Antwort an den Kunden..."
                    rows={8}
                    className="resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSendResponse} disabled={isResponding || !responseText.trim()} className="gap-2">
              {isResponding ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  Wird gesendet...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Antwort senden
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

