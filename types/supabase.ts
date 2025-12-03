export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          company_id: string
          completed_at: string | null
          created_at: string | null
          customer_id: string
          driver_id: string | null
          dropoff_address: string
          dropoff_location: unknown
          id: string
          notes: string | null
          passengers: number | null
          payment_method: string | null
          payment_status: string | null
          pickup_address: string
          pickup_location: unknown
          pickup_time: string
          price: number | null
          status: string | null
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          company_id: string
          completed_at?: string | null
          created_at?: string | null
          customer_id: string
          driver_id?: string | null
          dropoff_address: string
          dropoff_location?: unknown
          id?: string
          notes?: string | null
          passengers?: number | null
          payment_method?: string | null
          payment_status?: string | null
          pickup_address: string
          pickup_location?: unknown
          pickup_time: string
          price?: number | null
          status?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          company_id?: string
          completed_at?: string | null
          created_at?: string | null
          customer_id?: string
          driver_id?: string | null
          dropoff_address?: string
          dropoff_location?: unknown
          id?: string
          notes?: string | null
          passengers?: number | null
          payment_method?: string | null
          payment_status?: string | null
          pickup_address?: string
          pickup_location?: unknown
          pickup_time?: string
          price?: number | null
          status?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_book_entries: {
        Row: {
          amount: number
          balance_after: number
          booking_id: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          category: string | null
          company_id: string
          created_at: string | null
          created_by: string | null
          description: string
          entry_date: string
          entry_number: string
          entry_type: string
          id: string
          invoice_id: string | null
          is_cancelled: boolean | null
          net_amount: number | null
          receipt_number: string | null
          receipt_url: string | null
          tax_amount: number | null
          tax_rate: number | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          balance_after: number
          booking_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          category?: string | null
          company_id: string
          created_at?: string | null
          created_by?: string | null
          description: string
          entry_date: string
          entry_number: string
          entry_type: string
          id?: string
          invoice_id?: string | null
          is_cancelled?: boolean | null
          net_amount?: number | null
          receipt_number?: string | null
          receipt_url?: string | null
          tax_amount?: number | null
          tax_rate?: number | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          balance_after?: number
          booking_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          category?: string | null
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          description?: string
          entry_date?: string
          entry_number?: string
          entry_type?: string
          id?: string
          invoice_id?: string | null
          is_cancelled?: boolean | null
          net_amount?: number | null
          receipt_number?: string | null
          receipt_url?: string | null
          tax_amount?: number | null
          tax_rate?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cash_book_entries_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_book_entries_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_book_entries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_book_entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_book_entries_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          business_hours: Json | null
          company_slug: string | null
          created_at: string | null
          email: string
          id: string
          landingpage_description: string | null
          landingpage_enabled: boolean | null
          landingpage_hero_text: string | null
          landingpage_title: string | null
          logo_url: string | null
          name: string
          phone: string | null
          subscription_plan: string | null
          updated_at: string | null
          widget_button_text: string | null
          widget_enabled: boolean | null
        }
        Insert: {
          address?: string | null
          business_hours?: Json | null
          company_slug?: string | null
          created_at?: string | null
          email: string
          id?: string
          landingpage_description?: string | null
          landingpage_enabled?: boolean | null
          landingpage_hero_text?: string | null
          landingpage_title?: string | null
          logo_url?: string | null
          name: string
          phone?: string | null
          subscription_plan?: string | null
          updated_at?: string | null
          widget_button_text?: string | null
          widget_enabled?: boolean | null
        }
        Update: {
          address?: string | null
          business_hours?: Json | null
          company_slug?: string | null
          created_at?: string | null
          email?: string
          id?: string
          landingpage_description?: string | null
          landingpage_enabled?: boolean | null
          landingpage_hero_text?: string | null
          landingpage_title?: string | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          subscription_plan?: string | null
          updated_at?: string | null
          widget_button_text?: string | null
          widget_enabled?: boolean | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          company_id: string
          created_at: string | null
          customer_number: string | null
          email: string | null
          first_name: string
          id: string
          last_name: string
          notes: string | null
          phone: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          company_id: string
          created_at?: string | null
          customer_number?: string | null
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          notes?: string | null
          phone: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          company_id?: string
          created_at?: string | null
          customer_number?: string | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          notes?: string | null
          phone?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          company_id: string
          created_at: string | null
          current_lat: number | null
          current_lng: number | null
          current_location: unknown
          email: string | null
          first_name: string
          id: string
          last_name: string
          license_expiry: string | null
          license_number: string
          phone: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          current_lat?: number | null
          current_lng?: number | null
          current_location?: unknown
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          license_expiry?: string | null
          license_number: string
          phone: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          current_lat?: number | null
          current_lng?: number | null
          current_location?: unknown
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          license_expiry?: string | null
          license_number?: string
          phone?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          booking_id: string | null
          company_id: string
          created_at: string | null
          customer_id: string
          due_date: string | null
          id: string
          invoice_number: string
          paid_date: string | null
          status: string | null
          tax_amount: number | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          amount: number
          booking_id?: string | null
          company_id: string
          created_at?: string | null
          customer_id: string
          due_date?: string | null
          id?: string
          invoice_number: string
          paid_date?: string | null
          status?: string | null
          tax_amount?: number | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string | null
          company_id?: string
          created_at?: string | null
          customer_id?: string
          due_date?: string | null
          id?: string
          invoice_number?: string
          paid_date?: string | null
          status?: string | null
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_id: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_items: {
        Row: {
          created_at: string | null
          description: string
          id: string
          position: number
          quantity: number
          quote_id: string
          total_price: number
          unit: string | null
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          position?: number
          quantity?: number
          quote_id: string
          total_price?: number
          unit?: string | null
          unit_price?: number
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          position?: number
          quantity?: number
          quote_id?: string
          total_price?: number
          unit?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          booking_id: string | null
          company_id: string
          converted_at: string | null
          converted_to_invoice_id: string | null
          created_at: string | null
          customer_id: string | null
          distance_km: number | null
          driver_id: string | null
          dropoff_address: string | null
          estimated_duration: number | null
          id: string
          internal_notes: string | null
          notes: string | null
          passengers: number | null
          payment_terms: string | null
          pdf_url: string | null
          pickup_address: string | null
          pickup_date: string | null
          pickup_time: string | null
          quote_number: string
          sent_at: string | null
          sent_to_email: string | null
          status: string
          subtotal: number
          tax_amount: number
          tax_rate: number
          total_amount: number
          updated_at: string | null
          valid_until: string | null
          vehicle_id: string | null
          vehicle_type: string | null
        }
        Insert: {
          booking_id?: string | null
          company_id: string
          converted_at?: string | null
          converted_to_invoice_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          distance_km?: number | null
          driver_id?: string | null
          dropoff_address?: string | null
          estimated_duration?: number | null
          id?: string
          internal_notes?: string | null
          notes?: string | null
          passengers?: number | null
          payment_terms?: string | null
          pdf_url?: string | null
          pickup_address?: string | null
          pickup_date?: string | null
          pickup_time?: string | null
          quote_number: string
          sent_at?: string | null
          sent_to_email?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          total_amount?: number
          updated_at?: string | null
          valid_until?: string | null
          vehicle_id?: string | null
          vehicle_type?: string | null
        }
        Update: {
          booking_id?: string | null
          company_id?: string
          converted_at?: string | null
          converted_to_invoice_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          distance_km?: number | null
          driver_id?: string | null
          dropoff_address?: string | null
          estimated_duration?: number | null
          id?: string
          internal_notes?: string | null
          notes?: string | null
          passengers?: number | null
          payment_terms?: string | null
          pdf_url?: string | null
          pickup_address?: string | null
          pickup_date?: string | null
          pickup_time?: string | null
          quote_number?: string
          sent_at?: string | null
          sent_to_email?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          total_amount?: number
          updated_at?: string | null
          valid_until?: string | null
          vehicle_id?: string | null
          vehicle_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_converted_to_invoice_id_fkey"
            columns: ["converted_to_invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          color: string | null
          company_id: string
          created_at: string | null
          current_lat: number | null
          current_lng: number | null
          id: string
          license_plate: string
          make: string
          model: string
          seats: number | null
          status: string | null
          updated_at: string | null
          year: number | null
        }
        Insert: {
          color?: string | null
          company_id: string
          created_at?: string | null
          current_lat?: number | null
          current_lng?: number | null
          id?: string
          license_plate: string
          make: string
          model: string
          seats?: number | null
          status?: string | null
          updated_at?: string | null
          year?: number | null
        }
        Update: {
          color?: string | null
          company_id?: string
          created_at?: string | null
          current_lat?: number | null
          current_lng?: number | null
          id?: string
          license_plate?: string
          make?: string
          model?: string
          seats?: number | null
          status?: string | null
          updated_at?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

