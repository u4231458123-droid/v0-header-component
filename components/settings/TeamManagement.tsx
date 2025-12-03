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
} from "lucide-react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { de } from "date-fns/locale"

interface TeamMember {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: string
  created_at: string
  last_sign_in_at?: string
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
      toast.error("Bitte geben Sie eine E-Mail-Adresse ein")
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

      toast.success(`Einladung an ${inviteForm.email} gesendet`)
      setInviteDialogOpen(false)
      setInviteForm({ email: "", role: "user" })
      loadInvitations()
      loadActivityLog()
    } catch (error: any) {
      toast.error(error.message || "Fehler beim Senden der Einladung")
    } finally {
      setInviteLoading(false)
    }
  }

  const handleCancelInvitation = async (invitationId: string) => {
    const { error } = await supabase.from("team_invitations").delete().eq("id", invitationId)

    if (!error) {
      toast.success("Einladung zurückgezogen")
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
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  Einladen
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
                  <div>
                    <p className="font-medium">{member.full_name || "Kein Name"}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
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
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
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
    </Card>
  )
}
