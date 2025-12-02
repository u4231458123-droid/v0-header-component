// ============================================================================
// Partner-System Types
// ============================================================================

export type PartnerConnectionStatus = "pending" | "accepted" | "rejected" | "blocked"

export type PartnerBookingStatus =
  | "eingegangen"
  | "zugewiesen"
  | "in_bearbeitung"
  | "fahrer_unterwegs"
  | "abgeschlossen"
  | "storniert"

export interface PartnerConnection {
  id: string
  company_a_id: string
  company_b_id: string
  status: PartnerConnectionStatus
  notes?: string
  created_at: string
  updated_at: string
  accepted_at?: string
  rejected_at?: string
  // Joined data
  company_a?: {
    id: string
    name: string
    email: string
    md_id: string
  }
  company_b?: {
    id: string
    name: string
    email: string
    md_id: string
  }
}

export interface PartnerBooking {
  id: string
  original_booking_id: string
  source_company_id: string
  partner_company_id: string
  partner_driver_id?: string
  partner_vehicle_id?: string
  partner_status: PartnerBookingStatus
  commission_percent: number
  commission_amount: number
  created_at: string
  updated_at: string
  accepted_at?: string
  completed_at?: string
  // Joined data
  original_booking?: {
    id: string
    pickup_address: string
    dropoff_address: string
    pickup_time: string
    price: number
    status: string
    customer?: {
      first_name: string
      last_name: string
      phone: string
    }
  }
  source_company?: {
    id: string
    name: string
    md_id: string
  }
  partner_company?: {
    id: string
    name: string
    md_id: string
  }
}

export interface PartnerBookingHistory {
  id: string
  partner_booking_id: string
  changed_by_company_id: string
  changed_by_user_id?: string
  old_status?: PartnerBookingStatus
  new_status: PartnerBookingStatus
  comment?: string
  created_at: string
  // Joined
  changed_by_company?: {
    name: string
  }
  changed_by_user?: {
    full_name: string
  }
}
