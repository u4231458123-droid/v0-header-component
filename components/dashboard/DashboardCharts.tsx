"use client"

import { TrendingUp, Euro } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { useEffect, useState } from "react"

interface RevenueDataPoint {
  date: string
  amount: number
  label: string
}

interface DashboardChartsProps {
  revenueData: RevenueDataPoint[]
  totalRevenue: number
}

function useChartColors() {
  const [colors, setColors] = useState({
    primary: "hsl(225 30% 29%)", // #343f60
    border: "hsl(225 15% 88%)", // Design-Token
    mutedForeground: "hsl(225 10% 45%)", // Design-Token
    card: "hsl(0 0% 100%)", // Design-Token
    foreground: "hsl(240 10% 10%)", // Design-Token
  })

  useEffect(() => {
    const root = document.documentElement
    const computedStyle = getComputedStyle(root)

    const getColor = (varName: string, fallback: string) => {
      const value = computedStyle.getPropertyValue(varName).trim()
      if (!value) return fallback
      // Handle HSL values without hsl() wrapper
      if (value.match(/^\d+\s+\d+%?\s+\d+%?$/)) {
        return `hsl(${value})`
      }
      return value
    }

    setColors({
      primary: getColor("--primary", "hsl(225 30% 29%)"), // #343f60
      border: getColor("--border", "hsl(225 15% 88%)"), // Design-Token
      mutedForeground: getColor("--muted-foreground", "hsl(225 10% 45%)"), // Design-Token
      card: getColor("--card", "hsl(0 0% 100%)"), // Design-Token
      foreground: getColor("--foreground", "hsl(240 10% 10%)"), // Design-Token
    })
  }, [])

  return colors
}

export function DashboardCharts({ revenueData = [], totalRevenue = 0 }: DashboardChartsProps) {
  const colors = useChartColors()

  // Berechne Durchschnitt und Maximum
  const avgRevenue = revenueData.length > 0 ? revenueData.reduce((sum, d) => sum + d.amount, 0) / revenueData.length : 0
  const maxRevenue = revenueData.length > 0 ? Math.max(...revenueData.map((d) => d.amount)) : 0
  const bestDay = revenueData.find((d) => d.amount === maxRevenue)

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Umsatz der letzten 30 Tage</h3>
              <p className="text-xs text-muted-foreground">Tagesuebersicht Ihrer Einnahmen</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">
              {totalRevenue.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR
            </p>
            <p className="text-xs text-muted-foreground">Gesamtumsatz</p>
          </div>
        </div>
      </div>

      <div className="p-5">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-5 mb-6">
          <div className="bg-muted/30 rounded-xl p-3">
            <p className="text-xs text-muted-foreground mb-1">Durchschnitt/Tag</p>
            <p className="text-lg font-semibold">
              {avgRevenue.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR
            </p>
          </div>
          <div className="bg-muted/30 rounded-xl p-3">
            <p className="text-xs text-muted-foreground mb-1">Bester Tag</p>
            <p className="text-lg font-semibold">
              {maxRevenue.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR
            </p>
            {bestDay && <p className="text-[10px] text-muted-foreground">{bestDay.label}</p>}
          </div>
          <div className="bg-muted/30 rounded-xl p-3">
            <p className="text-xs text-muted-foreground mb-1">Tage mit Umsatz</p>
            <p className="text-lg font-semibold">{revenueData.filter((d) => d.amount > 0).length} / 30</p>
          </div>
        </div>

        {/* Area Chart */}
        <div className="h-[250px]">
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.primary} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={colors.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: colors.mutedForeground }}
                  interval="preserveStartEnd"
                  tickMargin={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: colors.mutedForeground }}
                  tickFormatter={(value) => `${value} EUR`}
                  width={70}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: colors.card,
                    border: `1px solid ${colors.border}`,
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [
                    `${value.toLocaleString("de-DE", { minimumFractionDigits: 2 })} EUR`,
                    "Umsatz",
                  ]}
                  labelStyle={{ color: colors.foreground, fontWeight: 600 }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke={colors.primary}
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <Euro className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Keine Umsatzdaten vorhanden</p>
                <p className="text-xs text-muted-foreground mt-1">Abgeschlossene Auftraege werden hier angezeigt</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
