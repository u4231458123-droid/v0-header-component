import type { Database } from "./supabase"

/**
 * Vollständiges Customer-Type basierend auf dem Datenbank-Schema
 * und allen Migrationen (001_add_customer_columns, add_missing_columns_v1, etc.)
 */
export type Customer = Database["public"]["Tables"]["customers"]["Row"] & {
  // Erweiterte Felder aus Migrationen
  mobile?: string | null
  company_name?: string | null
  contact_person?: string | null
  address_type?: "private" | "business" | null
  business_address?: string | null
  business_postal_code?: string | null
  business_city?: string | null
  status?: "active" | "inactive" | "blocked" | null
  
  // Optionale Felder, die in der UI verwendet werden, aber möglicherweise nicht in der DB sind
  salutation?: "Herr" | "Frau" | "Divers" | null
  postal_code?: string | null
  city?: string | null
  
  // Berechnete Felder (nicht in DB)
  booking_count?: number
}

/**
 * Customer-Insert-Type für neue Kunden
 */
export type CustomerInsert = Database["public"]["Tables"]["customers"]["Insert"] & {
  mobile?: string | null
  company_name?: string | null
  contact_person?: string | null
  address_type?: "private" | "business" | null
  business_address?: string | null
  business_postal_code?: string | null
  business_city?: string | null
  status?: "active" | "inactive" | "blocked" | null
  salutation?: "Herr" | "Frau" | "Divers" | null
  postal_code?: string | null
  city?: string | null
}

/**
 * Customer-Update-Type für Aktualisierungen
 */
export type CustomerUpdate = Database["public"]["Tables"]["customers"]["Update"] & {
  mobile?: string | null
  company_name?: string | null
  contact_person?: string | null
  address_type?: "private" | "business" | null
  business_address?: string | null
  business_postal_code?: string | null
  business_city?: string | null
  status?: "active" | "inactive" | "blocked" | null
  salutation?: "Herr" | "Frau" | "Divers" | null
  postal_code?: string | null
  city?: string | null
}
