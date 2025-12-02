"use client"

interface PremiumDashboardContentProps {
  pageType?: "home" | "product"
}

export function PremiumDashboardContent({ pageType = "home" }: PremiumDashboardContentProps) {
  return (
    <div className="relative rounded-2xl border border-border shadow-2xl overflow-hidden bg-card p-8">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-muted/50 rounded-xl">
            <div className="text-sm text-muted-foreground mb-1">Aufträge Heute</div>
            <div className="text-3xl font-bold text-foreground">142</div>
          </div>
          <div className="p-4 bg-muted/50 rounded-xl">
            <div className="text-sm text-muted-foreground mb-1">Umsatz</div>
            <div className="text-3xl font-bold text-foreground">12.5k€</div>
          </div>
        </div>
        <div className="h-2 bg-muted rounded animate-pulse" />
        <div className="h-2 bg-muted rounded animate-pulse w-3/4" />
        <div className="h-2 bg-muted rounded animate-pulse w-1/2" />
      </div>
    </div>
  )
}
