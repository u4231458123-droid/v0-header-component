"use client"

interface V28BillingToggleProps {
  billingPeriod: "monthly" | "yearly"
  onToggle: (period: "monthly" | "yearly") => void
  discountText?: string
}

export function V28BillingToggle({ billingPeriod, onToggle, discountText }: V28BillingToggleProps) {
  return (
    <div className="flex items-center gap-5 p-1 bg-muted rounded-xl">
      <button
        onClick={() => onToggle("monthly")}
        className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${
          billingPeriod === "monthly"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Monatlich
      </button>
      <button
        onClick={() => onToggle("yearly")}
        className={`px-6 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
          billingPeriod === "yearly"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Jährlich
        {discountText && (
          <span className="px-2 py-0.5 bg-success/20 text-success text-xs font-bold rounded">{discountText}</span>
        )}
      </button>
    </div>
  )
}
