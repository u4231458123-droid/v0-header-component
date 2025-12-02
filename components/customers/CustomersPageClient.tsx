"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { PageHeader } from "@/components/design-system/PageHeader"
import { StatsCard } from "@/components/design-system/StatsCard"
import { FilterBar } from "@/components/design-system/FilterBar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CustomerDetailsDialog } from "@/components/customers/CustomerDetailsDialog"
import { SALUTATION_OPTIONS, VALIDATION_RULES } from "@/lib/form-constants"
import { Users, UserCheck, UserPlus, Euro, Plus, Eye } from "lucide-react"
import { safeNumber } from "@/lib/utils/safe-number"
import { toast } from "react-toastify"

interface CustomersPageClientProps {
  initialCustomers?: any[]
  bookings?: any[]
  invoices?: any[]
  companyId?: string | null
}

const fetchCustomers = async (companyId: string) => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
  if (error) throw error
  return data || []
}

export function CustomersPageClient({
  initialCustomers = [],
  bookings = [],
  invoices = [],
  companyId = null,
}: CustomersPageClientProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [newDialogOpen, setNewDialogOpen] = useState(false)
  const [detailCustomer, setDetailCustomer] = useState<any>(null)
  const [newCustomer, setNewCustomer] = useState({
    salutation: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    mobile: "",
    address: "",
    postal_code: "",
    city: "",
    company_name: "",
    contact_person: "",
    business_address: "",
    business_postal_code: "",
    business_city: "",
  })

  const [customers, setCustomers] = useState(initialCustomers)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchCustomersData = useCallback(async () => {
    if (!companyId) return
    const supabase = createClient()
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
    if (!error && data) {
      setCustomers(data)
    }
  }, [companyId])

  const mutateCustomers = useCallback(async () => {
    setIsRefreshing(true)
    await fetchCustomersData()
    setIsRefreshing(false)
  }, [fetchCustomersData])

  useEffect(() => {
    const interval = setInterval(mutateCustomers, 30000)
    const handleFocus = () => mutateCustomers()
    window.addEventListener("focus", handleFocus)
    return () => {
      clearInterval(interval)
      window.removeEventListener("focus", handleFocus)
    }
  }, [mutateCustomers])

  const supabase = createClient()

  const stats = useMemo(() => {
    const totalCustomers = customers.length
    const activeCustomers = customers.filter((c) => c.status === "active").length
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const newCustomers = customers.filter((c) => new Date(c.created_at) > thirtyDaysAgo).length
    const totalRevenue = (bookings || [])
      .filter((b) => b.status === "completed")
      .reduce((sum, b) => sum + (b.price || 0), 0)

    return { totalCustomers, activeCustomers, newCustomers, totalRevenue }
  }, [customers, bookings])

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const matchesSearch =
        searchTerm === "" ||
        customer.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm)
      const matchesStatus = statusFilter === "all" || customer.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [customers, searchTerm, statusFilter])

  const hasActiveFilters = searchTerm !== "" || statusFilter !== "all"

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      active: {
        label: "Aktiv",
        className: "bg-primary/10 text-primary",
      },
      inactive: { label: "Inaktiv", className: "bg-muted text-muted-foreground" },
      blocked: { label: "Gesperrt", className: "bg-destructive/10 text-destructive" },
    }
    const c = config[status] || config.active
    return <Badge className={c.className}>{c.label}</Badge>
  }

  const handleCreateCustomer = async () => {
    if (!companyId || !newCustomer.first_name || !newCustomer.last_name) {
      return
    }

    const { data, error } = await supabase
      .from("customers")
      .insert({
        company_id: companyId,
        salutation: newCustomer.salutation,
        first_name: newCustomer.first_name,
        last_name: newCustomer.last_name.toUpperCase(),
        email: newCustomer.email,
        phone: newCustomer.phone,
        mobile: newCustomer.mobile,
        address: newCustomer.address,
        postal_code: newCustomer.postal_code,
        city: newCustomer.city,
        status: "active",
      })
      .select()
      .single()

    if (!error && data) {
      mutateCustomers()
      setNewDialogOpen(false)
      setNewCustomer({
        salutation: "",
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        mobile: "",
        address: "",
        postal_code: "",
        city: "",
        company_name: "",
        contact_person: "",
        business_address: "",
        business_postal_code: "",
        business_city: "",
      })
    } else {
      toast.error("Fehler beim Hinzufuegen des Kunden")
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Kunden" description="Verwalten Sie Ihre Kundendaten">
        <Button onClick={() => setNewDialogOpen(true)} className="gap-2 rounded-xl">
          <Plus className="h-4 w-4" />
          Neuer Kunde
        </Button>
      </PageHeader>

      <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Kunden Gesamt"
          value={stats.totalCustomers}
          subtitle="Alle registrierten Kunden"
          icon={<Users className="h-5 w-5 text-primary" />}
          onClick={() => setStatusFilter("all")}
        />
        <StatsCard
          title="Aktive Kunden"
          value={stats.activeCustomers}
          subtitle="Mit aktivem Status"
          icon={<UserCheck className="h-5 w-5 text-primary" />}
          onClick={() => setStatusFilter("active")}
        />
        <StatsCard
          title="Neukunden (30 Tage)"
          value={stats.newCustomers}
          subtitle="In den letzten 30 Tagen"
          icon={<UserPlus className="h-5 w-5 text-primary" />}
        />
        <StatsCard
          title="Gesamtumsatz"
          value={`${safeNumber(stats.totalRevenue).toFixed(2)} EUR`}
          subtitle="Abgeschlossene Auftraege"
          icon={<Euro className="h-5 w-5 text-primary" />}
        />
      </div>

      <FilterBar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Suchen nach Name, E-Mail, Telefon..."
        showReset={hasActiveFilters}
        onReset={() => {
          setSearchTerm("")
          setStatusFilter("all")
        }}
      >
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px] rounded-xl">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="active">Aktiv</SelectItem>
            <SelectItem value="inactive">Inaktiv</SelectItem>
            <SelectItem value="blocked">Gesperrt</SelectItem>
          </SelectContent>
        </Select>
      </FilterBar>

      <Card className="rounded-2xl border-border overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Kundenliste</CardTitle>
          <CardDescription>
            {filteredCustomers.length} von {customers.length} Kunden
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold hidden md:table-cell">Kontakt</TableHead>
                  <TableHead className="font-semibold hidden lg:table-cell">Adresse</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      Keine Kunden gefunden
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {customer.salutation && `${customer.salutation} `}
                            {customer.first_name} <span className="uppercase">{customer.last_name}</span>
                          </span>
                          {customer.email && <span className="text-xs text-muted-foreground">{customer.email}</span>}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {customer.phone || customer.mobile || "-"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {customer.city || "-"}
                      </TableCell>
                      <TableCell>{getStatusBadge(customer.status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setDetailCustomer(customer)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Neuen Kunden anlegen</DialogTitle>
            <DialogDescription>Erfassen Sie die Kundendaten</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="private" className="mt-4">
            <TabsList className="grid w-full grid-cols-2 rounded-xl">
              <TabsTrigger value="private" className="rounded-lg">
                Privat
              </TabsTrigger>
              <TabsTrigger value="business" className="rounded-lg">
                Geschaeftlich
              </TabsTrigger>
            </TabsList>

            <TabsContent value="private" className="space-y-4 mt-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Anrede</Label>
                  <Select
                    value={newCustomer.salutation}
                    onValueChange={(v) => setNewCustomer({ ...newCustomer, salutation: v })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Bitte waehlen" />
                    </SelectTrigger>
                    <SelectContent>
                      {SALUTATION_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Vorname *</Label>
                  <Input
                    value={newCustomer.first_name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, first_name: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>NACHNAME *</Label>
                  <Input
                    value={newCustomer.last_name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, last_name: e.target.value.toUpperCase() })}
                    className="rounded-xl uppercase"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>E-Mail</Label>
                  <Input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefon</Label>
                  <Input
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    maxLength={VALIDATION_RULES.phone.maxLength}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Adresse</Label>
                <Input
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>PLZ</Label>
                  <Input
                    value={newCustomer.postal_code}
                    onChange={(e) => setNewCustomer({ ...newCustomer, postal_code: e.target.value })}
                    maxLength={VALIDATION_RULES.postalCode.maxLength}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ort</Label>
                  <Input
                    value={newCustomer.city}
                    onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="business" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Firmenname</Label>
                <Input
                  value={newCustomer.company_name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, company_name: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Ansprechpartner/in</Label>
                <Input
                  value={newCustomer.contact_person}
                  onChange={(e) => setNewCustomer({ ...newCustomer, contact_person: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Geschaeftsadresse</Label>
                <Input
                  value={newCustomer.business_address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, business_address: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>PLZ</Label>
                  <Input
                    value={newCustomer.business_postal_code}
                    onChange={(e) => setNewCustomer({ ...newCustomer, business_postal_code: e.target.value })}
                    maxLength={5}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ort</Label>
                  <Input
                    value={newCustomer.business_city}
                    onChange={(e) => setNewCustomer({ ...newCustomer, business_city: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setNewDialogOpen(false)} className="rounded-xl">
              Abbrechen
            </Button>
            <Button onClick={handleCreateCustomer} className="rounded-xl">
              Kunde anlegen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {detailCustomer && (
        <CustomerDetailsDialog
          customer={detailCustomer}
          open={!!detailCustomer}
          onOpenChange={(open) => !open && setDetailCustomer(null)}
        />
      )}
    </div>
  )
}
