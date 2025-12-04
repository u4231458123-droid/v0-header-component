"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { PageHeader } from "@/components/design-system/PageHeader"
import { StatsCard } from "@/components/design-system/StatsCard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  Send,
  Download,
  Search,
  UserPlus,
  Check,
  X,
  MoreHorizontal,
  MessageSquare,
  Building2,
  Copy,
  ExternalLink,
  Clock,
  Car,
  UserCog,
  Share2,
  ArrowRightLeft,
  Eye,
  Truck,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

interface Company {
  id: string
  name: string
  mydispatch_id: string
  email?: string
  phone?: string
  address?: string
  bank_info?: any
  contact_info?: any
  legal_info?: any
  logo_url?: string
}

interface Connection {
  id: string
  requester_company_id: string
  target_company_id: string
  status: string
  created_at: string
  accepted_at?: string
  share_vehicles?: boolean
  share_drivers?: boolean
  can_assign_bookings?: boolean
  requester_company?: Company
  target_company?: Company
}

interface PartnerBooking {
  id: string
  source_company_id: string
  target_company_id: string
  status: string
  booking_data?: any
  shared_fields?: Record<string, boolean>
  internal_message?: string
  created_at: string
}

interface Driver {
  id: string
  first_name: string
  last_name: string
  status: string
  company_id?: string
}

interface Vehicle {
  id: string
  make: string
  model: string
  license_plate: string
  seats: number
  status: string
  category?: string
  company_id?: string
}

interface PartnerResource {
  partnerId: string
  partnerName: string
  partnerMdId: string
  drivers: Driver[]
  vehicles: Vehicle[]
}

interface PartnerPageClientProps {
  company?: Company | null
  connections?: Connection[]
  partnerBookings?: PartnerBooking[]
  drivers?: Driver[]
  vehicles?: Vehicle[]
}

// Verfuegbare Felder fuer Auftragsuebermittlung
const BOOKING_FIELDS = [
  { key: "booking_id", label: "Auftrags-ID", group: "basic" },
  { key: "booking_date", label: "Datum", group: "basic" },
  { key: "booking_time", label: "Uhrzeit", group: "basic" },
  { key: "customer_salutation", label: "Anrede Kunde", group: "customer" },
  { key: "customer_first_name", label: "Vorname Kunde", group: "customer" },
  { key: "customer_last_name", label: "Nachname Kunde", group: "customer" },
  { key: "pickup_address", label: "Abholadresse", group: "route" },
  { key: "dropoff_address", label: "Zieladresse", group: "route" },
  { key: "passenger_count", label: "Passagieranzahl", group: "passenger" },
  { key: "passenger_names", label: "Passagiernamen", group: "passenger" },
  { key: "vehicle_category", label: "Fahrzeugkategorie", group: "vehicle" },
  { key: "flight_train_origin", label: "Flug/Zug Herkunft", group: "transport" },
  { key: "flight_train_number", label: "Flug/Zug Nummer", group: "transport" },
  { key: "assigned_driver_name", label: "Fahrer", group: "assignment" },
  { key: "assigned_vehicle", label: "Fahrzeug", group: "assignment" },
  { key: "license_plate", label: "Kennzeichen", group: "assignment" },
  { key: "price", label: "Fahrpreis", group: "price" },
]

export function PartnerPageClient({
  company = null,
  connections = [],
  partnerBookings = [],
  drivers = [],
  vehicles = [],
}: PartnerPageClientProps) {
  const [searchMdId, setSearchMdId] = useState("")
  const [searchResult, setSearchResult] = useState<Company | null>(null)
  const [searching, setSearching] = useState(false)
  const [localConnections, setLocalConnections] = useState<Connection[]>(connections || [])
  const [localBookings, setLocalBookings] = useState<PartnerBooking[]>(partnerBookings || [])
  const [activeTab, setActiveTab] = useState("overview")

  const [partnerResources, setPartnerResources] = useState<PartnerResource[]>([])
  const [loadingResources, setLoadingResources] = useState(false)

  // Dialog States
  const [showSendBookingDialog, setShowSendBookingDialog] = useState(false)
  const [showPartnerDetailsDialog, setShowPartnerDetailsDialog] = useState(false)
  const [showMessageDialog, setShowMessageDialog] = useState(false)
  const [showAcceptDialog, setShowAcceptDialog] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState<Connection | null>(null)

  const [acceptSharingOptions, setAcceptSharingOptions] = useState({
    share_vehicles: true,
    share_drivers: true,
    can_assign_bookings: true,
  })

  // Booking Form State
  const [bookingForm, setBookingForm] = useState({
    partner_id: "",
    booking_id: "",
    booking_date: "",
    booking_time: "",
    customer_salutation: "",
    customer_first_name: "",
    customer_last_name: "",
    pickup_address: "",
    dropoff_address: "",
    passenger_count: 1,
    passenger_names: "",
    vehicle_category: "",
    flight_train_origin: "",
    flight_train_number: "",
    driver_id: "",
    vehicle_id: "",
    price: "",
    internal_message: "",
  })
  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>({
    booking_id: true,
    booking_date: true,
    booking_time: true,
    pickup_address: true,
    dropoff_address: true,
    passenger_count: true,
  })

  // Message State
  const [messageText, setMessageText] = useState("")

  const supabase = createClient()

  const pendingRequests = useMemo(
    () => localConnections.filter((c) => c.status === "pending" && c.target_company_id === company?.id),
    [localConnections, company?.id],
  )

  const sentRequests = useMemo(
    () => localConnections.filter((c) => c.status === "pending" && c.requester_company_id === company?.id),
    [localConnections, company?.id],
  )

  const activePartners = useMemo(() => localConnections.filter((c) => c.status === "accepted"), [localConnections])

  const stats = useMemo(() => {
    const activePartnersCount = activePartners.length
    const sentBookings = localBookings.filter((b) => b.source_company_id === company?.id).length
    const receivedBookings = localBookings.filter((b) => b.target_company_id === company?.id).length
    const pendingRequestsCount = pendingRequests.length
    const sharedVehicles = partnerResources.reduce((sum, p) => sum + p.vehicles.length, 0)
    const sharedDrivers = partnerResources.reduce((sum, p) => sum + p.drivers.length, 0)

    return {
      activePartners: activePartnersCount,
      sentBookings,
      receivedBookings,
      pendingRequests: pendingRequestsCount,
      sharedVehicles,
      sharedDrivers,
    }
  }, [activePartners, localBookings, company, partnerResources, pendingRequests])

  const resourcesLoadedRef = useRef(false)
  const activePartnerIdsRef = useRef<string>("")

  useEffect(() => {
    const loadPartnerResources = async () => {
      // Create a stable key from active partner IDs
      const partnerIds = activePartners
        .map((p) => p.id)
        .sort()
        .join(",")

      // Skip if already loaded with same partners
      if (resourcesLoadedRef.current && partnerIds === activePartnerIdsRef.current) {
        return
      }

      if (activePartners.length === 0) {
        setPartnerResources([])
        resourcesLoadedRef.current = true
        activePartnerIdsRef.current = ""
        return
      }

      setLoadingResources(true)
      const resources: PartnerResource[] = []

      for (const connection of activePartners) {
        const partnerId =
          connection.requester_company_id === company?.id
            ? connection.target_company_id
            : connection.requester_company_id
        const partner = getPartnerCompany(connection)

        // Pruefe ob Sharing aktiviert ist
        const canSeeVehicles = connection.share_vehicles
        const canSeeDrivers = connection.share_drivers

        let partnerDrivers: Driver[] = []
        let partnerVehicles: Vehicle[] = []

        if (canSeeDrivers) {
          const { data: driversData } = await supabase
            .from("drivers")
            .select("id, first_name, last_name, status, company_id")
            .eq("company_id", partnerId)
            .eq("status", "active")

          if (driversData) {
            partnerDrivers = driversData
          }
        }

        if (canSeeVehicles) {
          const { data: vehiclesData } = await supabase
            .from("vehicles")
            .select("id, make, model, license_plate, seats, status, category, company_id")
            .eq("company_id", partnerId)
            .eq("status", "active")

          if (vehiclesData) {
            partnerVehicles = vehiclesData
          }
        }

        if (partnerDrivers.length > 0 || partnerVehicles.length > 0) {
          resources.push({
            partnerId,
            partnerName: partner?.name || "Unbekannt",
            partnerMdId: partner?.mydispatch_id || "",
            drivers: partnerDrivers,
            vehicles: partnerVehicles,
          })
        }
      }

      setPartnerResources(resources)
      setLoadingResources(false)
      resourcesLoadedRef.current = true
      activePartnerIdsRef.current = partnerIds
    }

    loadPartnerResources()
  }, [activePartners, company?.id, supabase])

  const handleSearchPartner = async () => {
    if (!searchMdId.trim()) return
    setSearching(true)
    setSearchResult(null)

    const { data, error } = await supabase
      .from("companies")
      .select("id, name, mydispatch_id, email, phone")
      .eq("mydispatch_id", searchMdId.trim().toUpperCase())
      .neq("id", company?.id || "")
      .single()

    if (!error && data) {
      const existingConnection = localConnections.find(
        (c) =>
          (c.requester_company_id === company?.id && c.target_company_id === data.id) ||
          (c.target_company_id === company?.id && c.requester_company_id === data.id),
      )
      if (existingConnection) {
        toast.error("Verbindung existiert bereits")
      } else {
        setSearchResult(data as Company)
      }
    } else {
      toast.error("Kein Unternehmen mit dieser MyDispatch-ID gefunden")
    }
    setSearching(false)
  }

  const handleSendRequest = async () => {
    if (!searchResult || !company?.id) return

    const { data, error } = await supabase
      .from("partner_connections")
      .insert({
        requester_company_id: company.id,
        target_company_id: searchResult.id,
        status: "pending",
      })
      .select(`
        *,
        requester_company:companies!partner_connections_requester_company_id_fkey(id, name, mydispatch_id, email, phone),
        target_company:companies!partner_connections_target_company_id_fkey(id, name, mydispatch_id, email, phone)
      `)
      .single()

    if (!error && data) {
      setLocalConnections((prev) => [data as Connection, ...prev])
      setSearchResult(null)
      setSearchMdId("")
      toast.success("Partneranfrage gesendet")
    } else {
      toast.error("Fehler beim Senden der Anfrage")
    }
  }

  const openAcceptDialog = (connection: Connection) => {
    setSelectedPartner(connection)
    setAcceptSharingOptions({
      share_vehicles: true,
      share_drivers: true,
      can_assign_bookings: true,
    })
    setShowAcceptDialog(true)
  }

  const handleAcceptRequest = async () => {
    if (!selectedPartner) return

    const { error } = await supabase
      .from("partner_connections")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
        share_vehicles: acceptSharingOptions.share_vehicles,
        share_drivers: acceptSharingOptions.share_drivers,
        can_assign_bookings: acceptSharingOptions.can_assign_bookings,
      })
      .eq("id", selectedPartner.id)

    if (!error) {
      setLocalConnections((prev) =>
        prev.map((c) =>
          c.id === selectedPartner.id
            ? {
                ...c,
                status: "accepted",
                share_vehicles: acceptSharingOptions.share_vehicles,
                share_drivers: acceptSharingOptions.share_drivers,
                can_assign_bookings: acceptSharingOptions.can_assign_bookings,
              }
            : c,
        ),
      )
      setShowAcceptDialog(false)
      setSelectedPartner(null)
      toast.success("Partnerschaft angenommen - Unternehmensdaten wurden synchronisiert")
    } else {
      toast.error("Fehler beim Annehmen der Anfrage")
    }
  }

  const handleRejectRequest = async (connectionId: string) => {
    const { error } = await supabase.from("partner_connections").update({ status: "rejected" }).eq("id", connectionId)

    if (!error) {
      setLocalConnections((prev) => prev.filter((c) => c.id !== connectionId))
      toast.success("Anfrage abgelehnt")
    }
  }

  const handleUpdateSharing = async (connectionId: string, field: string, value: boolean) => {
    const { error } = await supabase
      .from("partner_connections")
      .update({ [field]: value })
      .eq("id", connectionId)

    if (!error) {
      setLocalConnections((prev) => prev.map((c) => (c.id === connectionId ? { ...c, [field]: value } : c)))
      toast.success("Sharing-Einstellung aktualisiert")
    } else {
      toast.error("Fehler beim Aktualisieren")
    }
  }

  const handleSendBooking = async () => {
    if (!bookingForm.partner_id || !company?.id) return

    const connection = activePartners.find((c) => {
      const partnerId = c.requester_company_id === company.id ? c.target_company_id : c.requester_company_id
      return partnerId === bookingForm.partner_id
    })

    if (!connection) return

    const allDrivers = [...drivers, ...partnerResources.flatMap((p) => p.drivers)]
    const allVehicles = [...vehicles, ...partnerResources.flatMap((p) => p.vehicles)]

    const selectedDriver = allDrivers.find((d) => d.id === bookingForm.driver_id)
    const selectedVehicle = allVehicles.find((v) => v.id === bookingForm.vehicle_id)

    // Erstelle booking_data JSONB Objekt mit ausgewaehlten Feldern
    const bookingData: any = {}
    if (selectedFields.booking_id) bookingData.booking_id = bookingForm.booking_id || `MD-${Date.now()}`
    if (selectedFields.booking_date) bookingData.booking_date = bookingForm.booking_date
    if (selectedFields.booking_time) bookingData.booking_time = bookingForm.booking_time
    if (selectedFields.customer_salutation) bookingData.customer_salutation = bookingForm.customer_salutation
    if (selectedFields.customer_first_name) bookingData.customer_first_name = bookingForm.customer_first_name
    if (selectedFields.customer_last_name) bookingData.customer_last_name = bookingForm.customer_last_name
    if (selectedFields.pickup_address) bookingData.pickup_address = bookingForm.pickup_address
    if (selectedFields.dropoff_address) bookingData.dropoff_address = bookingForm.dropoff_address
    if (selectedFields.passenger_count) bookingData.passenger_count = bookingForm.passenger_count
    if (selectedFields.passenger_names) bookingData.passenger_names = bookingForm.passenger_names
    if (selectedFields.vehicle_category) bookingData.vehicle_category = bookingForm.vehicle_category
    if (selectedFields.flight_train_origin) bookingData.flight_train_origin = bookingForm.flight_train_origin
    if (selectedFields.flight_train_number) bookingData.flight_train_number = bookingForm.flight_train_number
    if (selectedFields.assigned_driver_name && selectedDriver)
      bookingData.assigned_driver_name = `${selectedDriver.first_name} ${selectedDriver.last_name}`
    if (selectedFields.assigned_vehicle && selectedVehicle)
      bookingData.assigned_vehicle = `${selectedVehicle.make} ${selectedVehicle.model}`
    if (selectedFields.license_plate && selectedVehicle) bookingData.license_plate = selectedVehicle.license_plate
    if (selectedFields.price) bookingData.price = Number.parseFloat(bookingForm.price) || 0

    const { data, error } = await supabase
      .from("partner_bookings")
      .insert({
        source_company_id: company.id,
        target_company_id: bookingForm.partner_id,
        status: "pending",
        shared_fields: selectedFields,
        booking_data: bookingData,
        internal_message: bookingForm.internal_message,
      })
      .select()
      .single()

    if (!error && data) {
      setLocalBookings((prev) => [data as PartnerBooking, ...prev])
      setShowSendBookingDialog(false)
      resetBookingForm()
      toast.success("Auftrag an Partner gesendet")
    } else {
      toast.error("Fehler beim Senden des Auftrags")
    }
  }

  const resetBookingForm = () => {
    setBookingForm({
      partner_id: "",
      booking_id: "",
      booking_date: "",
      booking_time: "",
      customer_salutation: "",
      customer_first_name: "",
      customer_last_name: "",
      pickup_address: "",
      dropoff_address: "",
      passenger_count: 1,
      passenger_names: "",
      vehicle_category: "",
      flight_train_origin: "",
      flight_train_number: "",
      driver_id: "",
      vehicle_id: "",
      price: "",
      internal_message: "",
    })
    setSelectedFields({
      booking_id: true,
      booking_date: true,
      booking_time: true,
      pickup_address: true,
      dropoff_address: true,
      passenger_count: true,
    })
  }

  const getPartnerCompany = (connection: Connection) => {
    if (connection.requester_company_id === company?.id) {
      return connection.target_company
    }
    return connection.requester_company
  }

  const copyMdId = () => {
    if (company?.mydispatch_id) {
      navigator.clipboard.writeText(company.mydispatch_id)
      toast.success("MyDispatch-ID kopiert")
    }
  }

  const allAvailableDrivers = useMemo(() => {
    const own = drivers.map((d) => ({ ...d, isPartner: false, partnerName: "" }))
    const partner = partnerResources.flatMap((p) =>
      p.drivers.map((d) => ({ ...d, isPartner: true, partnerName: p.partnerName })),
    )
    return [...own, ...partner]
  }, [drivers, partnerResources])

  const allAvailableVehicles = useMemo(() => {
    const own = vehicles.map((v) => ({ ...v, isPartner: false, partnerName: "" }))
    const partner = partnerResources.flatMap((p) =>
      p.vehicles.map((v) => ({ ...v, isPartner: true, partnerName: p.partnerName })),
    )
    return [...own, ...partner]
  }, [vehicles, partnerResources])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Partner-Netzwerk"
        description="Verbinden Sie sich mit anderen MyDispatch-Unternehmen und teilen Sie Auftraege, Fahrzeuge und Fahrer"
      >
        <div className="flex items-center gap-2">
          {company?.mydispatch_id && (
            <Button variant="outline" size="sm" onClick={copyMdId}>
              <Copy className="w-4 h-4 mr-2" />
              Ihre ID: {company.mydispatch_id}
            </Button>
          )}
          <Button onClick={() => setShowSendBookingDialog(true)} disabled={activePartners.length === 0}>
              <Send className="w-4 h-4 mr-2" />
              Auftrag senden
            </Button>
        </div>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatsCard title="Aktive Partner" value={stats.activePartners} icon={<Users className="w-5 h-5" />} />
        <StatsCard title="Gesendete Auftraege" value={stats.sentBookings} icon={<Send className="w-5 h-5" />} />
        <StatsCard title="Erhaltene Auftraege" value={stats.receivedBookings} icon={<Download className="w-5 h-5" />} />
        <StatsCard
          title="Offene Anfragen"
          value={stats.pendingRequests}
          icon={<Clock className="w-5 h-5" />}
          variant={stats.pendingRequests > 0 ? "warning" : "default"}
        />
        <StatsCard title="Partner-Fahrzeuge" value={stats.sharedVehicles} icon={<Car className="w-5 h-5" />} />
        <StatsCard title="Partner-Fahrer" value={stats.sharedDrivers} icon={<UserCog className="w-5 h-5" />} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Uebersicht</TabsTrigger>
          <TabsTrigger value="requests">
            Anfragen {pendingRequests.length > 0 && <Badge className="ml-2">{pendingRequests.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="resources">
            Partner-Ressourcen
            {(stats.sharedVehicles > 0 || stats.sharedDrivers > 0) && (
              <Badge className="ml-2" variant="secondary">
                {stats.sharedVehicles + stats.sharedDrivers}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="bookings">Auftraege</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Eigene Partnernummer - Prominent angezeigt */}
          {company?.mydispatch_id && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Ihre MyDispatch-Partnernummer
                </CardTitle>
                <CardDescription>
                  Diese Nummer können Sie anderen Unternehmen mitteilen, um Partnerschaftsanfragen zu erhalten
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-background rounded-lg border-2 border-primary/30">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">MyDispatch-ID</p>
                      <p className="text-2xl font-bold text-primary font-mono">{company.mydispatch_id}</p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={copyMdId}>
                    <Copy className="w-4 h-4 mr-2" />
                    Kopieren
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Partner suchen */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Partner suchen
              </CardTitle>
              <CardDescription>
                Geben Sie die MyDispatch-ID eines anderen Unternehmens ein, um eine Verbindung anzufragen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="z.B. MD-ABC12345"
                  value={searchMdId}
                  onChange={(e) => setSearchMdId(e.target.value.toUpperCase())}
                  className="max-w-xs"
                />
                <Button onClick={handleSearchPartner} disabled={searching || !searchMdId.trim()}>
                  {searching ? "Suche..." : "Suchen"}
                </Button>
              </div>

              {searchResult && (
                <div className="mt-4 p-4 border rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{searchResult.name}</p>
                      <p className="text-sm text-muted-foreground">{searchResult.mydispatch_id}</p>
                    </div>
                  </div>
                  <Button onClick={handleSendRequest}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Anfrage senden
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Aktive Partner mit Sharing-Optionen */}
          <Card>
            <CardHeader>
              <CardTitle>Aktive Partnerschaften</CardTitle>
              <CardDescription>
                Unternehmen, mit denen Sie verbunden sind - verwalten Sie Sharing-Einstellungen
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activePartners.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Noch keine aktiven Partnerschaften. Suchen Sie nach Partnern oder warten Sie auf eingehende Anfragen.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unternehmen</TableHead>
                      <TableHead>MyDispatch-ID</TableHead>
                      <TableHead>Verbunden seit</TableHead>
                      <TableHead className="text-center">Fahrzeuge teilen</TableHead>
                      <TableHead className="text-center">Fahrer teilen</TableHead>
                      <TableHead className="text-center">Auftraege zuweisen</TableHead>
                      <TableHead className="text-right">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activePartners.map((connection) => {
                      const partner = getPartnerCompany(connection)
                      return (
                        <TableRow key={connection.id}>
                          <TableCell className="font-medium">{partner?.name || "Unbekannt"}</TableCell>
                          <TableCell>{partner?.mydispatch_id}</TableCell>
                          <TableCell>
                            {connection.accepted_at
                              ? new Date(connection.accepted_at).toLocaleDateString("de-DE")
                              : "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={connection.share_vehicles || false}
                              onCheckedChange={(checked) =>
                                handleUpdateSharing(connection.id, "share_vehicles", checked)
                              }
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={connection.share_drivers || false}
                              onCheckedChange={(checked) =>
                                handleUpdateSharing(connection.id, "share_drivers", checked)
                              }
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={connection.can_assign_bookings || false}
                              onCheckedChange={(checked) =>
                                handleUpdateSharing(connection.id, "can_assign_bookings", checked)
                              }
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedPartner(connection)
                                    setShowPartnerDetailsDialog(true)
                                  }}
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Details anzeigen
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedPartner(connection)
                                    setShowMessageDialog(true)
                                  }}
                                >
                                  <MessageSquare className="w-4 h-4 mr-2" />
                                  Nachricht senden
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setBookingForm((prev) => ({
                                      ...prev,
                                      partner_id:
                                        connection.requester_company_id === company?.id
                                          ? connection.target_company_id
                                          : connection.requester_company_id,
                                    }))
                                    setShowSendBookingDialog(true)
                                  }}
                                >
                                  <Send className="w-4 h-4 mr-2" />
                                  Auftrag senden
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Gesendete Anfragen */}
          {sentRequests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Gesendete Anfragen</CardTitle>
                <CardDescription>Anfragen, die noch nicht beantwortet wurden</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unternehmen</TableHead>
                      <TableHead>MyDispatch-ID</TableHead>
                      <TableHead>Gesendet am</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sentRequests.map((connection) => (
                      <TableRow key={connection.id}>
                        <TableCell className="font-medium">{connection.target_company?.name || "Unbekannt"}</TableCell>
                        <TableCell>{connection.target_company?.mydispatch_id}</TableCell>
                        <TableCell>{new Date(connection.created_at).toLocaleDateString("de-DE")}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">Ausstehend</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Eingehende Anfragen</CardTitle>
              <CardDescription>Partneranfragen, die auf Ihre Bestaetigung warten</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingRequests.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Keine offenen Anfragen</p>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((connection) => (
                    <div key={connection.id} className="p-4 border rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{connection.requester_company?.name || "Unbekannt"}</p>
                          <p className="text-sm text-muted-foreground">
                            {connection.requester_company?.mydispatch_id} - Anfrage vom{" "}
                            {new Date(connection.created_at).toLocaleDateString("de-DE")}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleRejectRequest(connection.id)}>
                          <X className="w-4 h-4 mr-1" />
                          Ablehnen
                        </Button>
                        <Button size="sm" onClick={() => openAcceptDialog(connection)}>
                          <Check className="w-4 h-4 mr-1" />
                          Annehmen
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Geteilte Ressourcen von Partnern
              </CardTitle>
              <CardDescription>
                Fahrzeuge und Fahrer, die Ihre Partner mit Ihnen teilen - nutzen Sie diese fuer Ihre Auftraege
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingResources ? (
                <p className="text-muted-foreground text-center py-8">Lade Partner-Ressourcen...</p>
              ) : partnerResources.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <p className="text-muted-foreground">Keine geteilten Ressourcen verfuegbar</p>
                  <p className="text-sm text-muted-foreground">
                    Aktivieren Sie das Sharing bei Ihren Partnern oder bitten Sie Ihre Partner, ihre Ressourcen zu
                    teilen.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {partnerResources.map((resource) => (
                    <div key={resource.partnerId} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{resource.partnerName}</p>
                          <p className="text-sm text-muted-foreground">{resource.partnerMdId}</p>
                        </div>
                        <Badge variant="outline" className="ml-auto">
                          <ArrowRightLeft className="w-3 h-3 mr-1" />
                          Partner
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Partner-Fahrzeuge */}
                        {resource.vehicles.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium flex items-center gap-2 text-sm">
                              <Car className="w-4 h-4" />
                              Fahrzeuge ({resource.vehicles.length})
                            </h4>
                            <div className="space-y-2">
                              {resource.vehicles.map((vehicle) => (
                                <div
                                  key={vehicle.id}
                                  className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm"
                                >
                                  <div>
                                    <span className="font-medium">
                                      {vehicle.make} {vehicle.model}
                                    </span>
                                    <span className="text-muted-foreground ml-2">({vehicle.license_plate})</span>
                                  </div>
                                  <Badge variant="secondary" className="text-xs">
                                    {vehicle.seats} Sitze
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Partner-Fahrer */}
                        {resource.drivers.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium flex items-center gap-2 text-sm">
                              <UserCog className="w-4 h-4" />
                              Fahrer ({resource.drivers.length})
                            </h4>
                            <div className="space-y-2">
                              {resource.drivers.map((driver) => (
                                <div
                                  key={driver.id}
                                  className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm"
                                >
                                  <span className="font-medium">
                                    {driver.first_name} {driver.last_name}
                                  </span>
                                  <Badge
                                    variant={driver.status === "active" ? "default" : "secondary"}
                                    className="text-xs"
                                  >
                                    {driver.status === "active" ? "Verfuegbar" : driver.status}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Partner-Auftraege</CardTitle>
              <CardDescription>Gesendete und empfangene Auftraege - Fremdauftraege sind gekennzeichnet</CardDescription>
            </CardHeader>
            <CardContent>
              {localBookings.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Noch keine Partner-Auftraege</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Richtung</TableHead>
                      <TableHead>Partner</TableHead>
                      <TableHead>Auftrags-ID</TableHead>
                      <TableHead>Datum</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {localBookings.map((booking) => {
                      const isSent = booking.source_company_id === company?.id
                      const partnerConnection = activePartners.find((c) => {
                        const partnerId =
                          c.requester_company_id === company?.id ? c.target_company_id : c.requester_company_id
                        return partnerId === (isSent ? booking.target_company_id : booking.source_company_id)
                      })
                      const partner = partnerConnection ? getPartnerCompany(partnerConnection) : null

                      return (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge variant={isSent ? "default" : "outline"}>
                                {isSent ? (
                                  <>
                                    <Send className="w-3 h-3 mr-1" />
                                    Gesendet
                                  </>
                                ) : (
                                  <>
                                    <Download className="w-3 h-3 mr-1" />
                                    Empfangen
                                  </>
                                )}
                              </Badge>
                              {!isSent && (
                                <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
                                  <Truck className="w-3 h-3 mr-1" />
                                  Fremdauftrag
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{partner?.name || "Unbekannt"}</TableCell>
                          <TableCell className="font-mono text-sm">{booking.booking_data?.booking_id || "-"}</TableCell>
                          <TableCell>{new Date(booking.created_at).toLocaleDateString("de-DE")}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                booking.status === "completed"
                                  ? "default"
                                  : booking.status === "accepted"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {booking.status === "pending"
                                ? "Ausstehend"
                                : booking.status === "accepted"
                                  ? "Angenommen"
                                  : booking.status === "completed"
                                    ? "Abgeschlossen"
                                    : booking.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Partneranfrage annehmen</DialogTitle>
            <DialogDescription>
              Waehlen Sie aus, welche Ressourcen Sie mit {selectedPartner?.requester_company?.name} teilen moechten.
              Diese Einstellungen koennen spaeter geaendert werden.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Car className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Fahrzeuge teilen</p>
                  <p className="text-sm text-muted-foreground">Partner kann Ihre aktiven Fahrzeuge sehen</p>
                </div>
              </div>
              <Switch
                checked={acceptSharingOptions.share_vehicles}
                onCheckedChange={(checked) => setAcceptSharingOptions((prev) => ({ ...prev, share_vehicles: checked }))}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <UserCog className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Fahrer teilen</p>
                  <p className="text-sm text-muted-foreground">Partner kann Ihre aktiven Fahrer sehen</p>
                </div>
              </div>
              <Switch
                checked={acceptSharingOptions.share_drivers}
                onCheckedChange={(checked) => setAcceptSharingOptions((prev) => ({ ...prev, share_drivers: checked }))}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Send className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Auftraege zuweisen erlauben</p>
                  <p className="text-sm text-muted-foreground">Partner kann Ihnen Auftraege senden</p>
                </div>
              </div>
              <Switch
                checked={acceptSharingOptions.can_assign_bookings}
                onCheckedChange={(checked) =>
                  setAcceptSharingOptions((prev) => ({ ...prev, can_assign_bookings: checked }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAcceptDialog(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleAcceptRequest}>
              <Check className="w-4 h-4 mr-2" />
              Partnerschaft annehmen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Booking Dialog - mit Partner-Ressourcen */}
      <Dialog open={showSendBookingDialog} onOpenChange={setShowSendBookingDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Auftrag an Partner senden</DialogTitle>
            <DialogDescription>
              Waehlen Sie die Daten aus, die Sie mit dem Partner teilen moechten. Klicken Sie auf die Checkboxen, um
              Felder ein- oder auszuschliessen. Sie koennen auch Partner-Fahrer und -Fahrzeuge zuweisen.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Partner auswaehlen */}
            <div className="space-y-2">
              <Label>Partner *</Label>
              <Select
                value={bookingForm.partner_id}
                onValueChange={(value) => setBookingForm((prev) => ({ ...prev, partner_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Partner auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {activePartners.map((connection) => {
                    const partner = getPartnerCompany(connection)
                    const partnerId =
                      connection.requester_company_id === company?.id
                        ? connection.target_company_id
                        : connection.requester_company_id
                    return (
                      <SelectItem key={connection.id} value={partnerId}>
                        {partner?.name} ({partner?.mydispatch_id})
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Auftragsfelder mit Checkboxen - Gruppiert */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">
                Auftragsdaten (anklicken zum Aktivieren/Deaktivieren)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {BOOKING_FIELDS.map((field) => (
                  <div
                    key={field.key}
                    className="flex items-start gap-2 p-2 border rounded hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      id={field.key}
                      checked={selectedFields[field.key] || false}
                      onCheckedChange={(checked) =>
                        setSelectedFields((prev) => ({ ...prev, [field.key]: checked === true }))
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label htmlFor={field.key} className="cursor-pointer font-medium text-sm">
                        {field.label}
                      </Label>
                      {field.key === "booking_id" && (
                        <Input
                          placeholder="z.B. MD-123456"
                          value={bookingForm.booking_id}
                          onChange={(e) => setBookingForm((prev) => ({ ...prev, booking_id: e.target.value }))}
                          className="mt-1 h-8 text-sm"
                          disabled={!selectedFields[field.key]}
                        />
                      )}
                      {field.key === "booking_date" && (
                        <Input
                          type="date"
                          value={bookingForm.booking_date}
                          onChange={(e) => setBookingForm((prev) => ({ ...prev, booking_date: e.target.value }))}
                          className="mt-1 h-8 text-sm"
                          disabled={!selectedFields[field.key]}
                        />
                      )}
                      {field.key === "booking_time" && (
                        <Input
                          type="time"
                          value={bookingForm.booking_time}
                          onChange={(e) => setBookingForm((prev) => ({ ...prev, booking_time: e.target.value }))}
                          className="mt-1 h-8 text-sm"
                          disabled={!selectedFields[field.key]}
                        />
                      )}
                      {field.key === "customer_salutation" && (
                        <Select
                          value={bookingForm.customer_salutation}
                          onValueChange={(value) => setBookingForm((prev) => ({ ...prev, customer_salutation: value }))}
                          disabled={!selectedFields[field.key]}
                        >
                          <SelectTrigger className="mt-1 h-8 text-sm">
                            <SelectValue placeholder="Anrede" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Herr">Herr</SelectItem>
                            <SelectItem value="Frau">Frau</SelectItem>
                            <SelectItem value="Divers">Divers</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      {field.key === "customer_first_name" && (
                        <Input
                          placeholder="Vorname"
                          value={bookingForm.customer_first_name}
                          onChange={(e) => setBookingForm((prev) => ({ ...prev, customer_first_name: e.target.value }))}
                          className="mt-1 h-8 text-sm"
                          disabled={!selectedFields[field.key]}
                        />
                      )}
                      {field.key === "customer_last_name" && (
                        <Input
                          placeholder="Nachname"
                          value={bookingForm.customer_last_name}
                          onChange={(e) => setBookingForm((prev) => ({ ...prev, customer_last_name: e.target.value }))}
                          className="mt-1 h-8 text-sm"
                          disabled={!selectedFields[field.key]}
                        />
                      )}
                      {field.key === "pickup_address" && (
                        <Input
                          placeholder="Abholadresse"
                          value={bookingForm.pickup_address}
                          onChange={(e) => setBookingForm((prev) => ({ ...prev, pickup_address: e.target.value }))}
                          className="mt-1 h-8 text-sm"
                          disabled={!selectedFields[field.key]}
                        />
                      )}
                      {field.key === "dropoff_address" && (
                        <Input
                          placeholder="Zieladresse"
                          value={bookingForm.dropoff_address}
                          onChange={(e) => setBookingForm((prev) => ({ ...prev, dropoff_address: e.target.value }))}
                          className="mt-1 h-8 text-sm"
                          disabled={!selectedFields[field.key]}
                        />
                      )}
                      {field.key === "passenger_count" && (
                        <Input
                          type="number"
                          min={1}
                          value={bookingForm.passenger_count}
                          onChange={(e) =>
                            setBookingForm((prev) => ({
                              ...prev,
                              passenger_count: Number.parseInt(e.target.value) || 1,
                            }))
                          }
                          className="mt-1 h-8 text-sm"
                          disabled={!selectedFields[field.key]}
                        />
                      )}
                      {field.key === "passenger_names" && (
                        <Input
                          placeholder="Namen der Passagiere"
                          value={bookingForm.passenger_names}
                          onChange={(e) => setBookingForm((prev) => ({ ...prev, passenger_names: e.target.value }))}
                          className="mt-1 h-8 text-sm"
                          disabled={!selectedFields[field.key]}
                        />
                      )}
                      {field.key === "vehicle_category" && (
                        <Select
                          value={bookingForm.vehicle_category}
                          onValueChange={(value) => setBookingForm((prev) => ({ ...prev, vehicle_category: value }))}
                          disabled={!selectedFields[field.key]}
                        >
                          <SelectTrigger className="mt-1 h-8 text-sm">
                            <SelectValue placeholder="Kategorie" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="komfort">Komfort</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="van">Van/Kleinbus</SelectItem>
                            <SelectItem value="luxury">Luxus</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      {field.key === "flight_train_origin" && (
                        <Input
                          placeholder="z.B. Frankfurt"
                          value={bookingForm.flight_train_origin}
                          onChange={(e) => setBookingForm((prev) => ({ ...prev, flight_train_origin: e.target.value }))}
                          className="mt-1 h-8 text-sm"
                          disabled={!selectedFields[field.key]}
                        />
                      )}
                      {field.key === "flight_train_number" && (
                        <Input
                          placeholder="z.B. LH 123 oder ICE 597"
                          value={bookingForm.flight_train_number}
                          onChange={(e) => setBookingForm((prev) => ({ ...prev, flight_train_number: e.target.value }))}
                          className="mt-1 h-8 text-sm"
                          disabled={!selectedFields[field.key]}
                        />
                      )}
                      {field.key === "assigned_driver_name" && (
                        <Select
                          value={bookingForm.driver_id}
                          onValueChange={(value) => setBookingForm((prev) => ({ ...prev, driver_id: value }))}
                          disabled={!selectedFields[field.key]}
                        >
                          <SelectTrigger className="mt-1 h-8 text-sm">
                            <SelectValue placeholder="Fahrer wählen" />
                          </SelectTrigger>
                          <SelectContent>
                            {allAvailableDrivers.length === 0 ? (
                              <SelectItem value="" disabled>
                                Keine Fahrer verfuegbar
                              </SelectItem>
                            ) : (
                              <>
                                {drivers.length > 0 && (
                                  <>
                                    <SelectItem value="header-own" disabled className="font-semibold text-xs">
                                      Eigene Fahrer
                                    </SelectItem>
                                    {drivers.map((driver) => (
                                      <SelectItem key={driver.id} value={driver.id}>
                                        {driver.first_name} {driver.last_name}
                                      </SelectItem>
                                    ))}
                                  </>
                                )}
                                {partnerResources.map(
                                  (resource) =>
                                    resource.drivers.length > 0 && (
                                      <div key={resource.partnerId}>
                                        <SelectItem
                                          value={`header-${resource.partnerId}`}
                                          disabled
                                          className="font-semibold text-xs"
                                        >
                                          {resource.partnerName} (Partner)
                                        </SelectItem>
                                        {resource.drivers.map((driver) => (
                                          <SelectItem key={driver.id} value={driver.id}>
                                            {driver.first_name} {driver.last_name}
                                          </SelectItem>
                                        ))}
                                      </div>
                                    ),
                                )}
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      )}
                      {field.key === "assigned_vehicle" && (
                        <Select
                          value={bookingForm.vehicle_id}
                          onValueChange={(value) => setBookingForm((prev) => ({ ...prev, vehicle_id: value }))}
                          disabled={!selectedFields[field.key]}
                        >
                          <SelectTrigger className="mt-1 h-8 text-sm">
                            <SelectValue placeholder="Fahrzeug wählen" />
                          </SelectTrigger>
                          <SelectContent>
                            {allAvailableVehicles.length === 0 ? (
                              <SelectItem value="" disabled>
                                Keine Fahrzeuge verfuegbar
                              </SelectItem>
                            ) : (
                              <>
                                {vehicles.length > 0 && (
                                  <>
                                    <SelectItem value="header-own" disabled className="font-semibold text-xs">
                                      Eigene Fahrzeuge
                                    </SelectItem>
                                    {vehicles.map((vehicle) => (
                                      <SelectItem key={vehicle.id} value={vehicle.id}>
                                        {vehicle.make} {vehicle.model} ({vehicle.license_plate})
                                      </SelectItem>
                                    ))}
                                  </>
                                )}
                                {partnerResources.map(
                                  (resource) =>
                                    resource.vehicles.length > 0 && (
                                      <div key={resource.partnerId}>
                                        <SelectItem
                                          value={`header-${resource.partnerId}`}
                                          disabled
                                          className="font-semibold text-xs"
                                        >
                                          {resource.partnerName} (Partner)
                                        </SelectItem>
                                        {resource.vehicles.map((vehicle) => (
                                          <SelectItem key={vehicle.id} value={vehicle.id}>
                                            {vehicle.make} {vehicle.model} ({vehicle.license_plate})
                                          </SelectItem>
                                        ))}
                                      </div>
                                    ),
                                )}
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      )}
                      {field.key === "license_plate" && (
                        <Input
                          placeholder="Wird automatisch ausgefuellt"
                          value={allAvailableVehicles.find((v) => v.id === bookingForm.vehicle_id)?.license_plate || ""}
                          className="mt-1 h-8 text-sm bg-muted"
                          disabled
                        />
                      )}
                      {field.key === "price" && (
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={bookingForm.price}
                          onChange={(e) => setBookingForm((prev) => ({ ...prev, price: e.target.value }))}
                          className="mt-1 h-8 text-sm"
                          disabled={!selectedFields[field.key]}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interne Nachricht */}
            <div className="space-y-2">
              <Label>Interne Nachricht an Partner (optional)</Label>
              <Textarea
                placeholder="Zusaetzliche Informationen fuer den Partner..."
                value={bookingForm.internal_message}
                onChange={(e) => setBookingForm((prev) => ({ ...prev, internal_message: e.target.value }))}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendBookingDialog(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSendBooking} disabled={!bookingForm.partner_id}>
              <Send className="w-4 h-4 mr-2" />
              Auftrag senden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Partner Details Dialog */}
      <Dialog open={showPartnerDetailsDialog} onOpenChange={setShowPartnerDetailsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Partner-Details</DialogTitle>
          </DialogHeader>
          {selectedPartner && (
            <div className="space-y-4">
              {(() => {
                const partner = getPartnerCompany(selectedPartner)
                return (
                  <>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">{partner?.name}</h3>
                        <p className="text-muted-foreground">{partner?.mydispatch_id}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {partner?.email && (
                        <div>
                          <p className="text-muted-foreground">E-Mail</p>
                          <p className="font-medium">{partner.email}</p>
                        </div>
                      )}
                      {partner?.phone && (
                        <div>
                          <p className="text-muted-foreground">Telefon</p>
                          <p className="font-medium">{partner.phone}</p>
                        </div>
                      )}
                      {partner?.address && (
                        <div className="col-span-2">
                          <p className="text-muted-foreground">Adresse</p>
                          <p className="font-medium">{partner.address}</p>
                        </div>
                      )}
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">Sharing-Status</h4>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <Badge variant={selectedPartner.share_vehicles ? "default" : "secondary"}>
                          <Car className="w-3 h-3 mr-1" />
                          Fahrzeuge: {selectedPartner.share_vehicles ? "Ja" : "Nein"}
                        </Badge>
                        <Badge variant={selectedPartner.share_drivers ? "default" : "secondary"}>
                          <UserCog className="w-3 h-3 mr-1" />
                          Fahrer: {selectedPartner.share_drivers ? "Ja" : "Nein"}
                        </Badge>
                        <Badge variant={selectedPartner.can_assign_bookings ? "default" : "secondary"}>
                          <Send className="w-3 h-3 mr-1" />
                          Auftraege: {selectedPartner.can_assign_bookings ? "Ja" : "Nein"}
                        </Badge>
                      </div>
                    </div>
                  </>
                )
              })()}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowPartnerDetailsDialog(false)}>Schliessen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nachricht an Partner</DialogTitle>
            <DialogDescription>
              Senden Sie eine interne Nachricht an {selectedPartner ? getPartnerCompany(selectedPartner)?.name : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Ihre Nachricht..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMessageDialog(false)}>
              Abbrechen
            </Button>
            <Button
              onClick={async () => {
                if (!selectedPartner || !messageText.trim()) return
                const { error } = await supabase.from("partner_messages").insert({
                  connection_id: selectedPartner.id,
                  sender_company_id: company?.id,
                  message: messageText,
                })
                if (!error) {
                  toast.success("Nachricht gesendet")
                  setShowMessageDialog(false)
                  setMessageText("")
                } else {
                  toast.error("Fehler beim Senden")
                }
              }}
              disabled={!messageText.trim()}
            >
              <Send className="w-4 h-4 mr-2" />
              Senden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
