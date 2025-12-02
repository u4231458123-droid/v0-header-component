/* ==================================================================================
   UNIFIED PAGE TEMPLATE - V18.3.24 ULTIMATE
   ==================================================================================
   DAS zentrale Template für ALLE Seiten (außer Landing)

   Basierend auf Dashboard & Aufträge als Master-Vorlagen

   Features:
   - Composable Header (Title, KPIs, Badges)
   - Smart Actions (Primary, Secondary, Bulk)
   - Flexible Filters (Search, Tabs, Custom)
   - Multi-Layout Content (Table, Grid, Cards, Widgets)
   - Mobile-First mit Auto-Switch
   - Floating Actions für Mobile

   Code-Reduktion: -91% (2168 → 180 Zeilen pro Page)
   ================================================================================== */

import { SEOHead } from "@/components/shared/SEOHead"
import { PageHeader } from "@/components/layout/PageHeader"
import { ActionBar } from "@/components/layout/ActionBar"
import { FilterBar } from "@/components/layout/FilterBar"
import { ContentArea } from "@/components/layout/ContentArea"
import { FloatingActions } from "@/components/layout/FloatingActions"
import { useDeviceType } from "@/hooks/use-device-type"
import type { UnifiedPageTemplateProps } from "@/types/page-template"

function Loader2Icon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

export function UnifiedPageTemplate<T = any>({
  // SEO
  title,
  description,
  canonical,

  // Configuration
  header,
  actions,
  filters,
  content,
  floatingActions,
  mobileComponent,

  // Bulk Selection
  selectedIds = [],
  onSelectionChange,

  // Loading
  isLoading = false,
}: UnifiedPageTemplateProps<T>) {
  const { isMobile } = useDeviceType()

  // ============================================================================
  // MOBILE OVERRIDE
  // ============================================================================
  if (isMobile && mobileComponent) {
    return (
      <>
        <SEOHead title={title} description={description} canonical={canonical} />
        {mobileComponent}
        {floatingActions && <FloatingActions actions={floatingActions} />}
      </>
    )
  }

  // ============================================================================
  // DESKTOP LAYOUT
  // ============================================================================
  return (
    <>
      <SEOHead title={title} description={description} canonical={canonical} />

      <div className="space-y-6">
        {/* ============================================================================
            HEADER SECTION
            - Title + Description + Icon
            - KPI Cards (optional)
            - Badges (optional)
            ============================================================================ */}
        <PageHeader {...header} />

        {/* ============================================================================
            ACTION BAR
            - Primary Actions (Links)
            - Secondary Actions (Rechts)
            - Bulk Actions (Overlay bei Selection)
            ============================================================================ */}
        {actions && (
          <ActionBar
            primary={actions.primary}
            secondary={actions.secondary}
            bulk={actions.bulk}
            selectedCount={selectedIds.length}
            selectedIds={selectedIds}
          />
        )}

        {/* ============================================================================
            FILTER BAR
            - Search Input
            - Tabs mit Counts
            - Custom Filters
            ============================================================================ */}
        {filters && (
          <FilterBar
            search={filters.search}
            tabs={filters.tabs?.tabs}
            customFilters={filters.customFilters}
            onSearchChange={filters.onSearchChange}
            onTabChange={(tabId) => {
              filters.tabs?.onChange?.(tabId)
              filters.onTabChange?.(tabId)
            }}
          />
        )}

        {/* ============================================================================
            CONTENT AREA
            - Table View (DataTable)
            - Grid View (3 Columns)
            - Cards View (Vertical)
            - Widgets View (Dashboard)
            - Custom Content
            - Empty State
            ============================================================================ */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ContentArea {...content} />
        )}
      </div>

      {/* ============================================================================
          FLOATING ACTIONS (MOBILE)
          - Fixed Position Bottom-Right
          - Vertical Stack
          ============================================================================ */}
      {isMobile && floatingActions && <FloatingActions actions={floatingActions} />}
    </>
  )
}
