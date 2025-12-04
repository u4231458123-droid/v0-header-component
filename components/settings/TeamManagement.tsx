"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Users,
  UserPlus,
  Mail,
  MoreVertical,
  Shield,
  Clock,
  Activity,
  CheckCircle,
  XCircle,
  Loader2,
  Send,
  Trash2,
  Edit,
  FileText,
  Car,
  Calendar,
  CreditCard,
  Settings,
  User,
  Upload,
  Download,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { de } from "date-fns/locale"
import { EmployeeDetailsDialog } from "./EmployeeDetailsDialog"
import { NewEmployeeDialog } from "./NewEmployeeDialog"

interface TeamMember {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: string
  created_at: string
  last_sign_in_at?: string
  // Erweiterte Felder (Migration 034)
  salutation?: string
  title?: string
  date_of_birth?: string
  nationality?: string
  phone?: string
  phone_mobile?: string
  address_data?: {
    street?: string
    house_number?: string
    postal_code?: string
    city?: string
    country?: string
  }
  employment_data?: {
    start_date?: string
    contract_type?: string
    department?: string
    position?: string
    working_hours?: number
    hourly_rate?: number
    monthly_salary?: number
  }
}

interface TeamInvitation {
  id: string
  email: string
  role: string
  created_at: string
  expires_at: string
  accepted_at: string | null
  invited_by_name?: string
}

interface ActivityLogEntry {
  id: string
  user_name: string
  action: string
  entity_type: string
  entity_name: string | null
  details: any
  created_at: string
}

interface EmployeeDocument {
  id: string
  document_type: string
  file_name: string
  file_url: string
  valid_from: string | null
  valid_until: string | null
  status: "pending" | "approved" | "rejected" | "expired"
  created_at: string
}

interface TeamManagementProps {
  companyId: string
  currentUserId: string
  currentUserRole: string
  teamMembers: TeamMember[]
  onRefresh: () => void
}

const ROLE_OPTIONS = [
  { value: "user", label: "Benutzer", description: "Kann Buchungen und Fahrten verwalten" },
  { value: "dispatcher", label: "Disponent", description: "Kann Fahrer und Fahrzeuge zuweisen" },
  { value: "admin", label: "Administrator", description: "Voller Zugriff auf alle Funktionen" },
]

const ACTION_ICONS: Record<string, any> = {
  create: CheckCircle,
  update: Edit,
  delete: Trash2,
  booking: Calendar,
  driver: User,
  vehicle: Car,
  invoice: CreditCard,
  document: FileText,
  settings: Settings,
}

const ACTION_COLORS: Record<string, string> = {
  create: "text-green-500",
  update: "text-blue-500",
  delete: "text-red-500",
}

const EMPLOYEE_DOCUMENT_TYPES = [
  // Persönliche Dokumente
  { key: "id_card", label: "Personalausweis (Vorderseite)", required: true },
  { key: "id_card_back", label: "Personalausweis (Rückseite)", required: false },
  { key: "photo", label: "Passfoto", required: false },
  // Beschäftigungsdokumente
  { key: "employment_contract", label: "Arbeitsvertrag", required: true },
  { key: "social_security_card", label: "Sozialversicherungsausweis", required: true },
  { key: "tax_id_confirmation", label: "Steuer-ID Bestätigung", required: false },
  // Gesundheit/Versicherung
  { key: "health_insurance_card", label: "Krankenkassenkarte", required: true },
  { key: "health_certificate", label: "Gesundheitszeugnis", required: false },
  // Qualifikationen
  { key: "qualification_certificate", label: "Qualifikationsnachweise", required: false },
  { key: "reference_letter", label: "Zeugnisse", required: false },
  // Finanzen
  { key: "bank_details", label: "Bankverbindung", required: true },
  // Sonstiges
  { key: "employee_other", label: "Sonstige Dokumente", required: false },
]

export function TeamManagement({
  companyId,
  currentUserId,
  currentUserRole,
  teamMembers,
  onRefresh,
}: TeamManagementProps) {
  const [activeTab, setActiveTab] = useState("members")
  const [invitations, setInvitations] = useState<TeamInvitation[]>([])
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteForm, setInviteForm] = useState({ email: "", role: "user" })
  const [inviteLoading, setInviteLoading] = useState(false)
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [employeeDocuments, setEmployeeDocuments] = useState<EmployeeDocument[]>([])
  const [uploadingDocument, setUploadingDocument] = useState<string | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [detailsMember, setDetailsMember] = useState<TeamMember | null>(null)
  const [newEmployeeDialogOpen, setNewEmployeeDialogOpen] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const isAdmin = currentUserRole === "master" || currentUserRole === "admin" || currentUserRole === "owner"

  // Load invitations and activity log
  useEffect(() => {
    loadInvitations()
    loadActivityLog()
  }, [companyId])

  const loadInvitations = async () => {
    const { data, error } = await supabase
      .from("team_invitations")
      .select("*")
      .eq("company_id", companyId)
      .is("accepted_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })

    if (!error && data) {
      setInvitations(data)
    }
  }

  const loadActivityLog = async () => {
    const { data, error } = await supabase
      .from("activity_log")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(50)

    if (!error && data) {
      setActivityLog(data)
    }
  }

  const handleInviteMember = async () => {
    if (!inviteForm.email) {
      toast.error("Bitte geben Sie eine E-Mail-Adresse ein", {
        description: "Die E-Mail-Adresse ist erforderlich, um eine Einladung zu senden.",
        duration: 5000,
      })
      return
    }

    setInviteLoading(true)

    try {
      // Generate unique token
      const token = crypto.randomUUID()
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

      const { error } = await supabase.from("team_invitations").insert({
        company_id: companyId,
        email: inviteForm.email.toLowerCase(),
        role: inviteForm.role,
        token: token,
        invited_by: currentUserId,
        expires_at: expiresAt.toISOString(),
      })

      if (error) throw error

      // Sende E-Mail-Einladung
      const emailResponse = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteForm.email.toLowerCase(),
          role: inviteForm.role,
          companyId,
          token,
        }),
      })

      if (!emailResponse.ok) {
        console.error("Failed to send invitation email")
        // Einladung wurde erstellt, aber E-Mail konnte nicht gesendet werden
        // Das ist nicht kritisch, da der Link auch manuell geteilt werden kann
      }

      // Log activity
      await supabase.from("activity_log").insert({
        company_id: companyId,
        user_id: currentUserId,
        user_name: teamMembers.find((m) => m.id === currentUserId)?.full_name || "Unbekannt",
        action: "create",
        entity_type: "invitation",
        entity_name: inviteForm.email,
        details: { role: inviteForm.role },
      })

      toast.success(`Einladung an ${inviteForm.email} gesendet`, {
        description: "Der Mitarbeiter erhält eine E-Mail mit einem Einladungslink.",
        duration: 4000,
      })
      setInviteDialogOpen(false)
      setInviteForm({ email: "", role: "user" })
      loadInvitations()
      loadActivityLog()
    } catch (error: any) {
      toast.error(error.message || "Fehler beim Senden der Einladung", {
        description: "Bitte überprüfen Sie die E-Mail-Adresse und versuchen Sie es erneut.",
        duration: 5000,
      })
    } finally {
      setInviteLoading(false)
    }
  }

  const handleCancelInvitation = async (invitationId: string) => {
    const { error } = await supabase.from("team_invitations").delete().eq("id", invitationId)

    if (!error) {
      toast.success("Einladung zurückgezogen", {
        description: "Die Einladung wurde gelöscht und kann nicht mehr verwendet werden.",
        duration: 4000,
      })
      loadInvitations()
    }
  }

  const handleUpdateMemberRole = async (memberId: string, newRole: string) => {
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", memberId)

    if (!error) {
      // Log activity
      const member = teamMembers.find((m) => m.id === memberId)
      await supabase.from("activity_log").insert({
        company_id: companyId,
        user_id: currentUserId,
        user_name: teamMembers.find((m) => m.id === currentUserId)?.full_name || "Unbekannt",
        action: "update",
        entity_type: "member_role",
        entity_name: member?.full_name || member?.email,
        details: { new_role: newRole },
      })

      toast.success("Rolle aktualisiert")
      onRefresh()
      loadActivityLog()
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (memberId === currentUserId) {
      toast.error("Sie können sich nicht selbst entfernen")
      return
    }

    const { error } = await supabase.from("profiles").update({ company_id: null, role: "user" }).eq("id", memberId)

    if (!error) {
      const member = teamMembers.find((m) => m.id === memberId)
      await supabase.from("activity_log").insert({
        company_id: companyId,
        user_id: currentUserId,
        user_name: teamMembers.find((m) => m.id === currentUserId)?.full_name || "Unbekannt",
        action: "delete",
        entity_type: "member",
        entity_name: member?.full_name || member?.email,
      })

      toast.success("Mitglied entfernt")
      onRefresh()
      loadActivityLog()
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner":
      case "master":
        return "default"
      case "admin":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "owner":
        return "Inhaber"
      case "master":
        return "Master"
      case "admin":
        return "Admin"
      case "dispatcher":
        return "Disponent"
      default:
        return "Benutzer"
    }
  }

  const handleOpenDocumentDialog = async (member: TeamMember) => {
    setSelectedMember(member)
    setDocumentDialogOpen(true)
    await loadEmployeeDocuments(member.id)
  }

  const loadEmployeeDocuments = async (profileId: string) => {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("profile_id", profileId)
      .eq("owner_type", "employee")
      .order("created_at", { ascending: false })

    if (!error && data) {
      setEmployeeDocuments(data)
    }
  }

  const handleUploadDocument = async (type: string, file: File) => {
    if (!selectedMember) return

    setUploadingDocument(type)

    try {
      // Dateigröße prüfen (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Datei ist zu groß. Maximale Größe: 10MB")
        setUploadingDocument(null)
        return
      }

      const fileName = `employees/${selectedMember.id}/${type}/${Date.now()}_${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("documents")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) {
        console.error("Upload error:", uploadError)
        toast.error(`Fehler beim Hochladen: ${uploadError.message}`)
        setUploadingDocument(null)
        return
      }

      // Dokument in Datenbank speichern
      const { error: insertError } = await supabase.from("documents").insert({
        profile_id: selectedMember.id,
        company_id: companyId,
        owner_type: "employee",
        document_type: type,
        file_name: file.name,
        file_url: fileName,
        file_size: file.size,
        mime_type: file.type,
        status: "pending",
      })

      if (insertError) {
        console.error("Insert error:", insertError)
        toast.error(`Fehler beim Speichern: ${insertError.message}`)
        // Lösche hochgeladene Datei bei Fehler
        await supabase.storage.from("documents").remove([fileName])
        setUploadingDocument(null)
        return
      }

      toast.success("Dokument erfolgreich hochgeladen")
      await loadEmployeeDocuments(selectedMember.id)
    } catch (error: any) {
      console.error("Error uploading document:", error)
      toast.error(`Fehler: ${error?.message || "Unbekannter Fehler"}`)
    } finally {
      setUploadingDocument(null)
    }
  }

  const handleDeleteDocument = async (documentId: string, fileUrl: string) => {
    if (!confirm("Möchten Sie dieses Dokument wirklich löschen?")) return

    const { error: deleteError } = await supabase.from("documents").delete().eq("id", documentId)

    if (!deleteError) {
      // Lösche Datei aus Storage
      await supabase.storage.from("documents").remove([fileUrl])
      toast.success("Dokument gelöscht")
      if (selectedMember) {
        await loadEmployeeDocuments(selectedMember.id)
      }
    } else {
      toast.error("Fehler beim Löschen des Dokuments")
    }
  }

  const handleDownloadDocument = async (fileUrl: string, fileName: string) => {
    const { data, error } = await supabase.storage.from("documents").createSignedUrl(fileUrl, 3600)

    if (error) {
      toast.error("Fehler beim Erstellen des Download-Links")
      return
    }

    window.open(data.signedUrl, "_blank")
  }

  const handleOpenDetailsDialog = (member: TeamMember) => {
    setDetailsMember(member)
    setDetailsDialogOpen(true)
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Team-Mitglieder
            </CardTitle>
            <CardDescription>
              Verwalten Sie die Benutzer Ihres Unternehmens und sehen Sie, wer was bearbeitet hat
            </CardDescription>
          </div>
          {isAdmin && (
            <>
              <NewEmployeeDialog
                companyId={companyId}
                currentUserId={currentUserId}
                open={newEmployeeDialogOpen}
                onOpenChange={setNewEmployeeDialogOpen}
                onSuccess={() => {
                  setNewEmployeeDialogOpen(false)
                  onRefresh()
                  loadInvitations()
                  loadActivityLog()
                }}
              />
              <Button className="gap-2" onClick={() => setNewEmployeeDialogOpen(true)}>
                <UserPlus className="w-4 h-4" />
                Neu anlegen
              </Button>
            </>
          )}
          {false && isAdmin && (
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  Einladen (Alt)
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Team-Mitglied einladen</DialogTitle>
                  <DialogDescription>
                    Senden Sie eine Einladung an eine E-Mail-Adresse, um ein neues Team-Mitglied hinzuzufügen.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="invite-email">E-Mail-Adresse</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      placeholder="mitarbeiter@example.com"
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invite-role">Rolle</Label>
                    <Select
                      value={inviteForm.role}
                      onValueChange={(value) => setInviteForm({ ...inviteForm, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_OPTIONS.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            <div>
                              <p className="font-medium">{role.label}</p>
                              <p className="text-xs text-muted-foreground">{role.description}</p>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                    Abbrechen
                  </Button>
                  <Button onClick={handleInviteMember} disabled={inviteLoading} className="gap-2">
                    {inviteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Einladung senden
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="members" className="gap-2">
              <Users className="w-4 h-4" />
              Mitglieder ({teamMembers.length})
            </TabsTrigger>
            <TabsTrigger value="invitations" className="gap-2">
              <Mail className="w-4 h-4" />
              Einladungen ({invitations.length})
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Activity className="w-4 h-4" />
              Aktivitäten
            </TabsTrigger>
          </TabsList>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-4">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {(member.full_name || member.email || "?").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 cursor-pointer" onClick={() => handleOpenDetailsDialog(member)}>
                    <p className="font-medium">{member.full_name || "Kein Name"}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    {member.employment_data?.position && (
                      <p className="text-xs text-muted-foreground">{member.employment_data.position}</p>
                    )}
                    {member.employment_data?.department && (
                      <p className="text-xs text-muted-foreground">{member.employment_data.department}</p>
                    )}
                    {member.last_sign_in_at && (
                      <p className="text-xs text-muted-foreground">
                        Zuletzt aktiv:{" "}
                        {formatDistanceToNow(new Date(member.last_sign_in_at), { addSuffix: true, locale: de })}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={getRoleBadgeVariant(member.role)}>{getRoleLabel(member.role)}</Badge>
                  {member.id === currentUserId && <Badge variant="secondary">Sie</Badge>}
                  {isAdmin && member.id !== currentUserId && member.role !== "owner" && member.role !== "master" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleUpdateMemberRole(member.id, "admin")}>
                          <Shield className="w-4 h-4 mr-2" />
                          Zum Admin machen
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateMemberRole(member.id, "dispatcher")}>
                          <User className="w-4 h-4 mr-2" />
                          Zum Disponent machen
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateMemberRole(member.id, "user")}>
                          <User className="w-4 h-4 mr-2" />
                          Zum Benutzer machen
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleOpenDetailsDialog(member)}>
                          <User className="w-4 h-4 mr-2" />
                          Details anzeigen
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenDocumentDialog(member)}>
                          <FileText className="w-4 h-4 mr-2" />
                          Dokumente verwalten
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Entfernen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}

            {teamMembers.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Keine Team-Mitglieder gefunden</p>
              </div>
            )}
          </TabsContent>

          {/* Invitations Tab */}
          <TabsContent value="invitations" className="space-y-4">
            {invitations.length > 0 ? (
              invitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-4 rounded-xl bg-muted">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="font-medium">{invitation.email}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        Läuft ab:{" "}
                        {formatDistanceToNow(new Date(invitation.expires_at), { addSuffix: true, locale: de })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{getRoleLabel(invitation.role)}</Badge>
                    <Badge variant="secondary" className="text-amber-600 border-amber-600">
                      Ausstehend
                    </Badge>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCancelInvitation(invitation.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Keine ausstehenden Einladungen</p>
                {isAdmin && (
                  <Button variant="link" onClick={() => setInviteDialogOpen(true)} className="mt-2">
                    Jetzt einladen
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4">
            {activityLog.length > 0 ? (
              <div className="space-y-2">
                {activityLog.map((entry) => {
                  const IconComponent = ACTION_ICONS[entry.action] || Activity
                  const colorClass = ACTION_COLORS[entry.action] || "text-muted-foreground"

                  return (
                    <div
                      key={entry.id}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                    >
                      <div className={`mt-0.5 ${colorClass}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-medium">{entry.user_name}</span>{" "}
                          <span className="text-muted-foreground">
                            {entry.action === "create" && "hat erstellt:"}
                            {entry.action === "update" && "hat bearbeitet:"}
                            {entry.action === "delete" && "hat gelöscht:"}
                          </span>{" "}
                          <span className="font-medium">{entry.entity_name || entry.entity_type}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true, locale: de })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Noch keine Aktivitäten aufgezeichnet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Dokument-Upload-Dialog */}
      <Dialog open={documentDialogOpen} onOpenChange={setDocumentDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dokumente für {selectedMember?.full_name || selectedMember?.email}</DialogTitle>
            <DialogDescription>
              Verwalten Sie die Mitarbeiter-Dokumente (Krankenkassenkarte, Bankverbindung, Arbeitsvertrag, etc.)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Dokument-Typen */}
            <div className="space-y-2">
              <Label>Dokument hochladen</Label>
              <div className="grid grid-cols-2 gap-2">
                {EMPLOYEE_DOCUMENT_TYPES.map((docType) => (
                  <div key={docType.key} className="space-y-2">
                    <Label className="text-sm">{docType.label}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleUploadDocument(docType.key, file)
                          }
                        }}
                        disabled={uploadingDocument === docType.key}
                        className="text-sm"
                      />
                      {uploadingDocument === docType.key && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hochgeladene Dokumente */}
            <div className="space-y-2">
              <Label>Hochgeladene Dokumente</Label>
              {employeeDocuments.length > 0 ? (
                <div className="space-y-2">
                  {employeeDocuments.map((doc) => {
                    const docType = EMPLOYEE_DOCUMENT_TYPES.find((dt) => dt.key === doc.document_type)
                    return (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 rounded-xl border bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{docType?.label || doc.document_type}</p>
                            <p className="text-xs text-muted-foreground">{doc.file_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true, locale: de })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              doc.status === "approved"
                                ? "default"
                                : doc.status === "rejected"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {doc.status === "approved"
                              ? "Genehmigt"
                              : doc.status === "rejected"
                                ? "Abgelehnt"
                                : "Ausstehend"}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownloadDocument(doc.file_url, doc.file_name)}
                            className="h-8 w-8"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteDocument(doc.id, doc.file_url)}
                              className="h-8 w-8 text-destructive"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Noch keine Dokumente hochgeladen
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDocumentDialogOpen(false)}>
              Schließen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      {detailsMember && (
        <EmployeeDetailsDialog
          employee={detailsMember}
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          onEmployeeUpdated={() => {
            onRefresh()
            setDetailsDialogOpen(false)
          }}
        />
      )}
    </Card>
  )
}
