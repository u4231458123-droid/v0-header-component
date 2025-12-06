# MyDispatch Component Architecture

## Component Tree Overview

```
app/
├── layout.tsx (RootLayout)
│   ├── ThemeProvider
│   ├── Toaster
│   └── {children}
│
├── page.tsx (HomePage)
│   └── HomePageClient
│       ├── Header
│       ├── HeroSection
│       ├── FeaturesSection
│       └── Footer
│
├── (dashboard)/
│   └── layout.tsx (DashboardLayout)
│       ├── Sidebar
│       ├── TopNav
│       └── {children}
│
├── (prelogin)/
│   └── layout.tsx (PreloginLayout)
│       ├── PreloginHeader
│       └── {children}
│
└── auth/
    ├── login/page.tsx
    ├── register/page.tsx
    └── callback/route.ts
```

## Core Components Structure

```
components/
├── ui/                    # Shadcn/UI Base Components
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── form.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── table.tsx
│   ├── tabs.tsx
│   └── toast.tsx
│
├── layout/                # Layout Components
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── Footer.tsx
│   ├── TopNav.tsx
│   └── MobileNav.tsx
│
├── bookings/              # Feature: Bookings
│   ├── BookingList.tsx
│   ├── BookingCard.tsx
│   ├── CreateBookingDialog.tsx
│   ├── EditBookingDialog.tsx
│   ├── BookingDetailsDialog.tsx
│   └── BookingCalendar.tsx
│
├── customers/             # Feature: Customers
│   ├── CustomerList.tsx
│   ├── CustomerCard.tsx
│   ├── CreateCustomerDialog.tsx
│   └── CustomerDetailsDialog.tsx
│
├── drivers/               # Feature: Drivers
│   ├── DriverList.tsx
│   ├── DriverCard.tsx
│   ├── CreateDriverDialog.tsx
│   ├── DriverDetailsDialog.tsx
│   └── DriverDocuments.tsx
│
├── invoices/              # Feature: Invoices
│   ├── InvoiceList.tsx
│   ├── NewInvoiceDialog.tsx
│   ├── InvoiceDetailsDialog.tsx
│   └── InvoicePDF.tsx
│
├── finanzen/              # Feature: Finance
│   ├── FinanzenPageClient.tsx
│   ├── QuoteList.tsx
│   ├── NewQuoteDialog.tsx
│   └── CashBookEntries.tsx
│
├── settings/              # Feature: Settings
│   ├── TeamManagement.tsx
│   ├── CompanySettings.tsx
│   └── UserProfile.tsx
│
├── dashboard/             # Feature: Dashboard
│   ├── DashboardStats.tsx
│   ├── RecentBookings.tsx
│   ├── UpcomingTasks.tsx
│   └── QuickActions.tsx
│
├── shared/                # Shared Components
│   ├── LoadingSpinner.tsx
│   ├── ErrorBoundary.tsx
│   ├── EmptyState.tsx
│   ├── ConfirmDialog.tsx
│   ├── SearchInput.tsx
│   └── Pagination.tsx
│
├── ai/                    # AI Components
│   ├── AIAssistant.tsx
│   ├── AIChat.tsx
│   └── AIBookingParser.tsx
│
└── design-system/         # Design System
    ├── DesignTokens.tsx
    ├── ColorPalette.tsx
    └── Typography.tsx
```

## Component Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Page | `{Feature}Page.tsx` | `BookingsPage.tsx` |
| List | `{Entity}List.tsx` | `CustomerList.tsx` |
| Card | `{Entity}Card.tsx` | `DriverCard.tsx` |
| Dialog | `{Action}{Entity}Dialog.tsx` | `CreateBookingDialog.tsx` |
| Form | `{Entity}Form.tsx` | `BookingForm.tsx` |
| Client Component | `{Feature}PageClient.tsx` | `DashboardPageClient.tsx` |

## Props Patterns

### Standard Component Props

```typescript
interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}
```

### List Component Props

```typescript
interface ListProps<T> {
  items: T[];
  isLoading?: boolean;
  onItemClick?: (item: T) => void;
  emptyMessage?: string;
}
```

### Dialog Component Props

```typescript
interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  initialData?: Entity;
}
```

### Form Component Props

```typescript
interface FormProps {
  defaultValues?: Partial<FormValues>;
  onSubmit: (values: FormValues) => Promise<void>;
  isSubmitting?: boolean;
}
```

## State Management

```
┌─────────────────────────────────────────────────────────────────┐
│                    STATE ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Server State (React Server Components)                        │
│   ──────────────────────────────────────                        │
│   - Database queries via Supabase                               │
│   - Server Actions for mutations                                │
│   - Revalidation via revalidatePath                             │
│                                                                 │
│   Client State (React Hooks)                                    │
│   ─────────────────────────                                     │
│   - useState for local UI state                                 │
│   - useOptimistic for optimistic updates                        │
│   - Custom hooks for shared logic                               │
│                                                                 │
│   Form State (React Hook Form + Zod)                            │
│   ──────────────────────────────────                            │
│   - Form validation with Zod schemas                            │
│   - Field-level error handling                                  │
│   - Submit state management                                     │
│                                                                 │
│   URL State (Next.js)                                           │
│   ─────────────────                                             │
│   - Search params for filters                                   │
│   - Pathname for navigation                                     │
│   - useSearchParams hook                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Design Token Usage

| Element | Token | Example |
|---------|-------|---------|
| Card Container | `rounded-2xl` | `<Card className="rounded-2xl">` |
| Button | `rounded-xl` | `<Button className="rounded-xl">` |
| Badge | `rounded-md` | `<Badge className="rounded-md">` |
| Standard Gap | `gap-5` | `<div className="flex gap-5">` |
| Active Tab | `bg-primary text-primary-foreground` | Tab-Styling |

## Import Patterns

```typescript
// UI Components (from shadcn)
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"

// Feature Components
import { BookingList } from "@/components/bookings/BookingList"
import { CreateBookingDialog } from "@/components/bookings/CreateBookingDialog"

// Shared Components
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { EmptyState } from "@/components/shared/EmptyState"

// Hooks
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

// Utils
import { cn } from "@/lib/utils"
```

