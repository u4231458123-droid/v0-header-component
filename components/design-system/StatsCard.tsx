"use client"

import { type ReactNode, useMemo, useId } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Area, AreaChart, ResponsiveContainer } from "recharts"

// Verschiedene Wellenformen für Abwechslung - exakt wie im Dashboard
const WAVE_PATTERNS = [
  "M0 25 Q10 20 20 22 T40 15 T60 20 T80 12 T100 18",
  "M0 20 Q15 25 25 18 T50 22 T75 15 T100 20",
  "M0 22 Q20 18 35 25 T60 15 T85 20 T100 12",
  "M0 18 Q12 22 25 15 T50 20 T75 18 T100 22",
]

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  sparklineData?: number[]
  onClick?: () => void
  variant?: "default" | "warning" | "success"
  showWave?: boolean
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  sparklineData,
  onClick,
  variant = "default",
  showWave = true,
}: StatsCardProps) {
  // Eindeutige ID für Gradient (React 18+ useId)
  const uniqueId = useId()

  const chartData = useMemo(() => {
    if (!sparklineData || sparklineData.length === 0) return null
    return sparklineData.map((value, index) => ({ value, index }))
  }, [sparklineData])

  // Wähle eine konsistente Wellenform basierend auf dem Titel
  const waveIndex = useMemo(() => {
    let hash = 0
    for (let i = 0; i < title.length; i++) {
      hash = (hash << 5) - hash + title.charCodeAt(i)
      hash = hash & hash
    }
    return Math.abs(hash) % WAVE_PATTERNS.length
  }, [title])

  const wavePath = WAVE_PATTERNS[waveIndex]
  const gradientId = `statscard-wave-${uniqueId.replace(/:/g, "")}`
  const chartGradientId = `statscard-chart-${uniqueId.replace(/:/g, "")}`

  const variantStyles = {
    default: "border-border hover:border-primary/50",
    warning: "border-warning/30 bg-warning/5",
    success: "border-success/30 bg-success/5",
  }

  return (
    <Card
      className={`relative overflow-hidden rounded-2xl transition-all duration-300 ${variantStyles[variant]} ${onClick ? "cursor-pointer hover:shadow-lg" : ""}`}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 z-10">
          {icon}
        </div>

        <div className="relative z-10 pr-12">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            {trend && (
              <div
                className={`flex items-center gap-1 text-xs font-medium ${trend.isPositive ? "text-success" : "text-destructive"}`}
              >
                <span>
                  {trend.isPositive ? "+" : ""}
                  {trend.value}%
                </span>
                <span className="text-muted-foreground">vs. Vormonat</span>
              </div>
            )}
          </div>
        </div>

        {/* Integrated Sparkline from Data */}
        {chartData && chartData.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-12 overflow-hidden rounded-b-2xl opacity-50">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={chartGradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill={`url(#${chartGradientId})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Decorative Wave Pattern (wenn keine Daten vorhanden) */}
        {!chartData && showWave && (
          <div className="absolute bottom-0 left-0 right-0 h-12 overflow-hidden rounded-b-2xl opacity-50">
            <svg viewBox="0 0 100 30" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={`${wavePath} V30 H0 Z`} fill={`url(#${gradientId})`} />
              <path d={wavePath} fill="none" stroke="hsl(var(--primary))" strokeWidth="2" />
            </svg>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
