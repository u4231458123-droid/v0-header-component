# MyDispatch Data Model (ER-Diagram)

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CORE ENTITIES                                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐          ┌─────────────────────┐
│      COMPANIES      │          │      PROFILES       │
├─────────────────────┤          ├─────────────────────┤
│ id (PK)             │◄─────────│ company_id (FK)     │
│ name                │          │ id (PK)             │
│ email               │          │ email               │
│ phone               │          │ full_name           │
│ address             │          │ avatar_url          │
│ logo_url            │          │ phone               │
│ company_slug        │          │ role                │
│ subscription_plan   │          │ created_at          │
│ widget_enabled      │          │ updated_at          │
│ business_hours      │          └─────────────────────┘
│ created_at          │                    │
│ updated_at          │                    │
└─────────────────────┘                    │
         │                                 │
         │                                 │
         ▼                                 ▼
┌─────────────────────┐          ┌─────────────────────┐
│     CUSTOMERS       │          │      DRIVERS        │
├─────────────────────┤          ├─────────────────────┤
│ id (PK)             │          │ id (PK)             │
│ company_id (FK)     │          │ company_id (FK)     │
│ user_id             │          │ user_id             │
│ customer_number     │          │ first_name          │
│ first_name          │          │ last_name           │
│ last_name           │          │ email               │
│ email               │          │ phone               │
│ phone               │          │ license_number      │
│ address             │          │ license_expiry      │
│ notes               │          │ status              │
│ created_at          │          │ current_location    │
│ updated_at          │          │ created_at          │
└─────────────────────┘          │ updated_at          │
         │                       └─────────────────────┘
         │                                 │
         │                                 │
         └────────────────┬────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BOOKINGS                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ id (PK)                                                                     │
│ company_id (FK) ──────────────────────────────────► COMPANIES               │
│ customer_id (FK) ─────────────────────────────────► CUSTOMERS               │
│ driver_id (FK) ───────────────────────────────────► DRIVERS                 │
│ vehicle_id (FK) ──────────────────────────────────► VEHICLES                │
│ pickup_address        │ dropoff_address                                     │
│ pickup_location       │ dropoff_location                                    │
│ pickup_time           │ completed_at                                        │
│ status                │ price                                               │
│ passengers            │ notes                                               │
│ payment_method        │ payment_status                                      │
│ created_at            │ updated_at                                          │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         │
         ▼
┌─────────────────────┐          ┌─────────────────────┐
│      INVOICES       │          │       QUOTES        │
├─────────────────────┤          ├─────────────────────┤
│ id (PK)             │          │ id (PK)             │
│ company_id (FK)     │          │ company_id (FK)     │
│ customer_id (FK)    │          │ customer_id (FK)    │
│ booking_id (FK)     │          │ booking_id (FK)     │
│ invoice_number      │          │ quote_number        │
│ amount              │          │ status              │
│ tax_amount          │          │ subtotal            │
│ total_amount        │          │ tax_rate            │
│ status              │          │ tax_amount          │
│ due_date            │          │ total_amount        │
│ paid_date           │          │ valid_until         │
│ created_at          │          │ pickup_address      │
│ updated_at          │          │ dropoff_address     │
└─────────────────────┘          │ notes               │
                                 │ created_at          │
                                 │ updated_at          │
                                 └─────────────────────┘
                                          │
                                          │
                                          ▼
                                 ┌─────────────────────┐
                                 │    QUOTE_ITEMS      │
                                 ├─────────────────────┤
                                 │ id (PK)             │
                                 │ quote_id (FK)       │
                                 │ description         │
                                 │ quantity            │
                                 │ unit_price          │
                                 │ total_price         │
                                 │ position            │
                                 │ unit                │
                                 │ created_at          │
                                 └─────────────────────┘


┌─────────────────────┐          ┌─────────────────────┐
│      VEHICLES       │          │  CASH_BOOK_ENTRIES  │
├─────────────────────┤          ├─────────────────────┤
│ id (PK)             │          │ id (PK)             │
│ company_id (FK)     │          │ company_id (FK)     │
│ make                │          │ entry_number        │
│ model               │          │ entry_date          │
│ year                │          │ entry_type          │
│ color               │          │ description         │
│ license_plate       │          │ amount              │
│ seats               │          │ balance_after       │
│ status              │          │ category            │
│ current_lat         │          │ booking_id (FK)     │
│ current_lng         │          │ invoice_id (FK)     │
│ created_at          │          │ created_by (FK)     │
│ updated_at          │          │ created_at          │
└─────────────────────┘          │ updated_at          │
                                 └─────────────────────┘
```

## Relationship Summary

| Parent | Child | Relationship | FK Column |
|--------|-------|--------------|-----------|
| companies | profiles | 1:N | company_id |
| companies | customers | 1:N | company_id |
| companies | drivers | 1:N | company_id |
| companies | vehicles | 1:N | company_id |
| companies | bookings | 1:N | company_id |
| companies | invoices | 1:N | company_id |
| companies | quotes | 1:N | company_id |
| customers | bookings | 1:N | customer_id |
| drivers | bookings | 1:N | driver_id |
| vehicles | bookings | 1:N | vehicle_id |
| bookings | invoices | 1:N | booking_id |
| customers | invoices | 1:N | customer_id |
| quotes | quote_items | 1:N | quote_id |

## Row Level Security (RLS)

All tables implement company-based RLS policies:

```sql
-- Example RLS Policy for bookings
CREATE POLICY "Users can view own company bookings"
ON bookings FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM profiles
    WHERE id = auth.uid()
  )
);
```

**Critical Rule:** NO master-admin policies that allow cross-company access (DSGVO compliance).

## Indexes

| Table | Column(s) | Type | Purpose |
|-------|-----------|------|---------|
| bookings | company_id | B-tree | RLS filtering |
| bookings | pickup_time | B-tree | Date range queries |
| bookings | status | B-tree | Status filtering |
| customers | company_id | B-tree | RLS filtering |
| drivers | company_id | B-tree | RLS filtering |
| invoices | company_id, status | Composite | Dashboard queries |

