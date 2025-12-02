import {
  LayoutDashboard,
  Car,
  Users,
  CalendarDays,
  Settings,
  BarChart3,
  CreditCard,
  Handshake,
  MessageCircle,
} from "lucide-react"

const navigationItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/fleet", icon: Car, label: "Fuhrpark" },
  { href: "/dashboard/bookings", icon: CalendarDays, label: "Aufträge" },
  { href: "/dashboard/customers", icon: Users, label: "Kunden" },
  { href: "/dashboard/partner", icon: Handshake, label: "Partner" },
  { href: "/dashboard/fahrer-chat", icon: MessageCircle, label: "Fahrer-Chat" },
  { href: "/dashboard/finanzen", icon: CreditCard, label: "Finanzen" },
  { href: "/dashboard/statistiken", icon: BarChart3, label: "Statistiken" },
  { href: "/dashboard/einstellungen", icon: Settings, label: "Einstellungen" },
]
