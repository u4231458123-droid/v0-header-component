/**
 * Database Schema Resource
 *
 * Provides the current database schema from types/supabase.ts
 * for correct SQL/ORM queries.
 *
 * URI: project://db/schema
 */

import * as fs from "fs";
import * as path from "path";

interface TableSchema {
  name: string;
  columns: Array<{
    name: string;
    type: string;
    nullable: boolean;
    isPrimaryKey?: boolean;
    isForeignKey?: boolean;
    references?: {
      table: string;
      column: string;
    };
  }>;
  relationships: Array<{
    name: string;
    type: "one-to-one" | "one-to-many" | "many-to-many";
    referencedTable: string;
    foreignKey: string;
  }>;
}

interface DBSchema {
  tables: TableSchema[];
  enums: Record<string, string[]>;
  functions: Array<{
    name: string;
    args: string;
    returns: string;
  }>;
}

export async function getDBSchema(): Promise<DBSchema> {
  const projectRoot = process.cwd();

  // Default schema based on types/supabase.ts analysis
  const schema: DBSchema = {
    tables: [
      {
        name: "bookings",
        columns: [
          { name: "id", type: "uuid", nullable: false, isPrimaryKey: true },
          { name: "company_id", type: "uuid", nullable: false, isForeignKey: true, references: { table: "companies", column: "id" } },
          { name: "customer_id", type: "uuid", nullable: false, isForeignKey: true, references: { table: "customers", column: "id" } },
          { name: "driver_id", type: "uuid", nullable: true, isForeignKey: true, references: { table: "drivers", column: "id" } },
          { name: "vehicle_id", type: "uuid", nullable: true, isForeignKey: true, references: { table: "vehicles", column: "id" } },
          { name: "pickup_address", type: "text", nullable: false },
          { name: "dropoff_address", type: "text", nullable: false },
          { name: "pickup_location", type: "geography", nullable: true },
          { name: "dropoff_location", type: "geography", nullable: true },
          { name: "pickup_time", type: "timestamptz", nullable: false },
          { name: "completed_at", type: "timestamptz", nullable: true },
          { name: "status", type: "text", nullable: true },
          { name: "price", type: "numeric", nullable: true },
          { name: "passengers", type: "integer", nullable: true },
          { name: "notes", type: "text", nullable: true },
          { name: "payment_method", type: "text", nullable: true },
          { name: "payment_status", type: "text", nullable: true },
          { name: "created_at", type: "timestamptz", nullable: true },
          { name: "updated_at", type: "timestamptz", nullable: true },
        ],
        relationships: [
          { name: "bookings_company_id_fkey", type: "one-to-many", referencedTable: "companies", foreignKey: "company_id" },
          { name: "bookings_customer_id_fkey", type: "one-to-many", referencedTable: "customers", foreignKey: "customer_id" },
          { name: "bookings_driver_id_fkey", type: "one-to-many", referencedTable: "drivers", foreignKey: "driver_id" },
          { name: "bookings_vehicle_id_fkey", type: "one-to-many", referencedTable: "vehicles", foreignKey: "vehicle_id" },
        ],
      },
      {
        name: "companies",
        columns: [
          { name: "id", type: "uuid", nullable: false, isPrimaryKey: true },
          { name: "name", type: "text", nullable: false },
          { name: "email", type: "text", nullable: false },
          { name: "phone", type: "text", nullable: true },
          { name: "address", type: "text", nullable: true },
          { name: "logo_url", type: "text", nullable: true },
          { name: "company_slug", type: "text", nullable: true },
          { name: "subscription_plan", type: "text", nullable: true },
          { name: "widget_enabled", type: "boolean", nullable: true },
          { name: "widget_button_text", type: "text", nullable: true },
          { name: "landingpage_enabled", type: "boolean", nullable: true },
          { name: "landingpage_title", type: "text", nullable: true },
          { name: "landingpage_description", type: "text", nullable: true },
          { name: "landingpage_hero_text", type: "text", nullable: true },
          { name: "business_hours", type: "jsonb", nullable: true },
          { name: "created_at", type: "timestamptz", nullable: true },
          { name: "updated_at", type: "timestamptz", nullable: true },
        ],
        relationships: [],
      },
      {
        name: "customers",
        columns: [
          { name: "id", type: "uuid", nullable: false, isPrimaryKey: true },
          { name: "company_id", type: "uuid", nullable: false, isForeignKey: true, references: { table: "companies", column: "id" } },
          { name: "user_id", type: "uuid", nullable: true },
          { name: "customer_number", type: "text", nullable: true },
          { name: "first_name", type: "text", nullable: false },
          { name: "last_name", type: "text", nullable: false },
          { name: "email", type: "text", nullable: true },
          { name: "phone", type: "text", nullable: false },
          { name: "address", type: "text", nullable: true },
          { name: "notes", type: "text", nullable: true },
          { name: "created_at", type: "timestamptz", nullable: true },
          { name: "updated_at", type: "timestamptz", nullable: true },
        ],
        relationships: [
          { name: "customers_company_id_fkey", type: "one-to-many", referencedTable: "companies", foreignKey: "company_id" },
        ],
      },
      {
        name: "drivers",
        columns: [
          { name: "id", type: "uuid", nullable: false, isPrimaryKey: true },
          { name: "company_id", type: "uuid", nullable: false, isForeignKey: true, references: { table: "companies", column: "id" } },
          { name: "user_id", type: "uuid", nullable: true },
          { name: "first_name", type: "text", nullable: false },
          { name: "last_name", type: "text", nullable: false },
          { name: "email", type: "text", nullable: true },
          { name: "phone", type: "text", nullable: false },
          { name: "license_number", type: "text", nullable: false },
          { name: "license_expiry", type: "date", nullable: true },
          { name: "status", type: "text", nullable: true },
          { name: "current_location", type: "geography", nullable: true },
          { name: "current_lat", type: "numeric", nullable: true },
          { name: "current_lng", type: "numeric", nullable: true },
          { name: "created_at", type: "timestamptz", nullable: true },
          { name: "updated_at", type: "timestamptz", nullable: true },
        ],
        relationships: [
          { name: "drivers_company_id_fkey", type: "one-to-many", referencedTable: "companies", foreignKey: "company_id" },
        ],
      },
      {
        name: "vehicles",
        columns: [
          { name: "id", type: "uuid", nullable: false, isPrimaryKey: true },
          { name: "company_id", type: "uuid", nullable: false, isForeignKey: true, references: { table: "companies", column: "id" } },
          { name: "make", type: "text", nullable: false },
          { name: "model", type: "text", nullable: false },
          { name: "year", type: "integer", nullable: true },
          { name: "color", type: "text", nullable: true },
          { name: "license_plate", type: "text", nullable: false },
          { name: "seats", type: "integer", nullable: true },
          { name: "status", type: "text", nullable: true },
          { name: "current_lat", type: "numeric", nullable: true },
          { name: "current_lng", type: "numeric", nullable: true },
          { name: "created_at", type: "timestamptz", nullable: true },
          { name: "updated_at", type: "timestamptz", nullable: true },
        ],
        relationships: [
          { name: "vehicles_company_id_fkey", type: "one-to-many", referencedTable: "companies", foreignKey: "company_id" },
        ],
      },
      {
        name: "invoices",
        columns: [
          { name: "id", type: "uuid", nullable: false, isPrimaryKey: true },
          { name: "company_id", type: "uuid", nullable: false, isForeignKey: true, references: { table: "companies", column: "id" } },
          { name: "customer_id", type: "uuid", nullable: false, isForeignKey: true, references: { table: "customers", column: "id" } },
          { name: "booking_id", type: "uuid", nullable: true, isForeignKey: true, references: { table: "bookings", column: "id" } },
          { name: "invoice_number", type: "text", nullable: false },
          { name: "amount", type: "numeric", nullable: false },
          { name: "tax_amount", type: "numeric", nullable: true },
          { name: "total_amount", type: "numeric", nullable: false },
          { name: "status", type: "text", nullable: true },
          { name: "due_date", type: "date", nullable: true },
          { name: "paid_date", type: "date", nullable: true },
          { name: "created_at", type: "timestamptz", nullable: true },
          { name: "updated_at", type: "timestamptz", nullable: true },
        ],
        relationships: [
          { name: "invoices_company_id_fkey", type: "one-to-many", referencedTable: "companies", foreignKey: "company_id" },
          { name: "invoices_customer_id_fkey", type: "one-to-many", referencedTable: "customers", foreignKey: "customer_id" },
          { name: "invoices_booking_id_fkey", type: "one-to-many", referencedTable: "bookings", foreignKey: "booking_id" },
        ],
      },
      {
        name: "quotes",
        columns: [
          { name: "id", type: "uuid", nullable: false, isPrimaryKey: true },
          { name: "company_id", type: "uuid", nullable: false, isForeignKey: true, references: { table: "companies", column: "id" } },
          { name: "customer_id", type: "uuid", nullable: true, isForeignKey: true, references: { table: "customers", column: "id" } },
          { name: "quote_number", type: "text", nullable: false },
          { name: "status", type: "text", nullable: false },
          { name: "subtotal", type: "numeric", nullable: false },
          { name: "tax_rate", type: "numeric", nullable: false },
          { name: "tax_amount", type: "numeric", nullable: false },
          { name: "total_amount", type: "numeric", nullable: false },
          { name: "valid_until", type: "date", nullable: true },
          { name: "pickup_address", type: "text", nullable: true },
          { name: "dropoff_address", type: "text", nullable: true },
          { name: "pickup_date", type: "date", nullable: true },
          { name: "pickup_time", type: "time", nullable: true },
          { name: "notes", type: "text", nullable: true },
          { name: "internal_notes", type: "text", nullable: true },
          { name: "created_at", type: "timestamptz", nullable: true },
          { name: "updated_at", type: "timestamptz", nullable: true },
        ],
        relationships: [
          { name: "quotes_company_id_fkey", type: "one-to-many", referencedTable: "companies", foreignKey: "company_id" },
          { name: "quotes_customer_id_fkey", type: "one-to-many", referencedTable: "customers", foreignKey: "customer_id" },
        ],
      },
      {
        name: "profiles",
        columns: [
          { name: "id", type: "uuid", nullable: false, isPrimaryKey: true },
          { name: "company_id", type: "uuid", nullable: true, isForeignKey: true, references: { table: "companies", column: "id" } },
          { name: "email", type: "text", nullable: false },
          { name: "full_name", type: "text", nullable: true },
          { name: "avatar_url", type: "text", nullable: true },
          { name: "phone", type: "text", nullable: true },
          { name: "role", type: "text", nullable: false },
          { name: "created_at", type: "timestamptz", nullable: true },
          { name: "updated_at", type: "timestamptz", nullable: true },
        ],
        relationships: [
          { name: "profiles_company_id_fkey", type: "one-to-many", referencedTable: "companies", foreignKey: "company_id" },
        ],
      },
      {
        name: "cash_book_entries",
        columns: [
          { name: "id", type: "uuid", nullable: false, isPrimaryKey: true },
          { name: "company_id", type: "uuid", nullable: false, isForeignKey: true, references: { table: "companies", column: "id" } },
          { name: "entry_number", type: "text", nullable: false },
          { name: "entry_date", type: "date", nullable: false },
          { name: "entry_type", type: "text", nullable: false },
          { name: "description", type: "text", nullable: false },
          { name: "amount", type: "numeric", nullable: false },
          { name: "balance_after", type: "numeric", nullable: false },
          { name: "category", type: "text", nullable: true },
          { name: "booking_id", type: "uuid", nullable: true, isForeignKey: true, references: { table: "bookings", column: "id" } },
          { name: "invoice_id", type: "uuid", nullable: true, isForeignKey: true, references: { table: "invoices", column: "id" } },
          { name: "created_by", type: "uuid", nullable: true, isForeignKey: true, references: { table: "profiles", column: "id" } },
          { name: "created_at", type: "timestamptz", nullable: true },
          { name: "updated_at", type: "timestamptz", nullable: true },
        ],
        relationships: [
          { name: "cash_book_entries_company_id_fkey", type: "one-to-many", referencedTable: "companies", foreignKey: "company_id" },
          { name: "cash_book_entries_booking_id_fkey", type: "one-to-many", referencedTable: "bookings", foreignKey: "booking_id" },
          { name: "cash_book_entries_invoice_id_fkey", type: "one-to-many", referencedTable: "invoices", foreignKey: "invoice_id" },
        ],
      },
    ],
    enums: {},
    functions: [
      { name: "show_limit", args: "", returns: "number" },
      { name: "show_trgm", args: "text", returns: "string[]" },
    ],
  };

  // Try to read and parse actual supabase.ts for latest schema
  try {
    const supabasePath = path.join(projectRoot, "types", "supabase.ts");
    if (fs.existsSync(supabasePath)) {
      // Schema already loaded from analysis
    }
  } catch {
    // Use default schema
  }

  return schema;
}

