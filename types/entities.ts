/**
 * Entity Types für MyDispatch
 * ============================
 * Zentrale TypeScript-Definitionen für alle Entitäten
 */

export interface Invoice {
  id: string
  invoice_number: string
  company_id: string
  customer_id: string
  booking_id: string | null
  status: "pending" | "paid" | "overdue" | "cancelled"
  subtotal: number
  tax_rate: number
  tax_amount: number
  total: number
  due_date: string | null
  paid_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
  customer?: Customer
  booking?: Booking
}

export interface Quote {
  id: string
  quote_number: string
  company_id: string
  customer_id: string | null
  status: "draft" | "sent" | "accepted" | "rejected" | "expired"
  subtotal: number
  tax_rate: number
  tax_amount: number
  total: number
  valid_until: string | null
  notes: string | null
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
  items?: QuoteItem[]
  customer?: Customer
}

export interface QuoteItem {
  id: string
  quote_id: string
  description: string
  quantity: number
  unit_price: number
  tax_rate: number
  total: number
  created_at: string
}

export interface Employee {
  id: string
  company_id: string
  email: string
  full_name: string | null
  role: "owner" | "admin" | "dispatcher" | "user" | "master"
  phone: string | null
  phone_mobile: string | null
  avatar_url: string | null
  salutation: string | null
  title: string | null
  date_of_birth: string | null
  nationality: string | null
  address_data: {
    street?: string
    house_number?: string
    postal_code?: string
    city?: string
    country?: string
  } | null
  employment_data: {
    start_date?: string
    contract_type?: string
    department?: string
    position?: string
    working_hours?: number
    hourly_rate?: number
    monthly_salary?: number
  } | null
  created_at: string
  updated_at: string
  last_sign_in_at: string | null
}

export interface Customer {
  id: string
  company_id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  address: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  company_id: string
  customer_id: string | null
  driver_id: string | null
  vehicle_id: string | null
  pickup_address: string
  dropoff_address: string
  pickup_time: string
  status: "pending" | "assigned" | "in_progress" | "completed" | "cancelled"
  passengers: number
  price: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: string
  company_id: string | null
  created_at: string
  updated_at: string
  last_sign_in_at: string | null
}

export interface Company {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  logo_url: string | null
  company_slug: string
  branding: Record<string, unknown> | null
  contact_info: Record<string, unknown> | null
  created_at: string
  updated_at: string
}
