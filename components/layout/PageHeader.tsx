"use client"

/* ==================================================================================
   PAGE HEADER COMPONENT - V18.3.24 ULTIMATE
   ==================================================================================
   VERPFLICHTEND für ALLE Seiten:
   - Title + Description + Icon
   - 3 KPI Cards (9 cols) + Schnellzugriff (3 cols)
   - Badges (Business+, etc.)

   Basiert auf PageHeaderWithKPIs Pattern (Dashboard-Standard)
   ================================================================================== */

import { Badge } from "@/components/ui/badge"
import { V28Button } from "@/components/design-system/V28Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/smart-templates/StatCard"
import type { PageHeaderConfig, KPIConfig, ActionConfig, BadgeConfig } from "@/types/page-template"
import type { ComponentType } from "react"

interface PageHeaderProps {
  title: string
  description?: string
  icon?: ComponentType<{ className?: string }>
  kpis?: KPIConfig[]
  quickActions?: ActionConfig[]
  badges?: BadgeConfig[]
}

export function PageHeader({ title, description, icon: Icon, kpis, quickActions, badges }: PageHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Title Row */}
      <div className="flex items-center justify-between flex-wrap gap-5">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Icon className="h-5 w-5 text-foreground" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
          </div>
        </div>

        {/* Badges */}
        {badges && badges.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {badges.map((badge, i) => (
              <Badge key={i} variant={badge.variant || "default"}>
                {badge.label}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* VERPFLICHTEND: 3 KPIs (9 cols) + Schnellzugriff (3 cols) */}
      {kpis && kpis.length > 0 && quickActions && quickActions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* KPI Cards - 9 cols */}
          <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {kpis.slice(0, 3).map((kpi, i) => (
              <StatCard key={i} label={kpi.label} value={kpi.value} icon={kpi.icon!} />
            ))}
          </div>

          {/* Schnellzugriff - 3 cols */}
          <div className="lg:col-span-3">
            <Card className="border-2 border-primary/20 shadow-md hover:shadow-lg hover:border-primary/40 transition-all duration-300 h-full flex flex-col bg-linear-to-br from-background to-primary/5 overflow-visible">
              <CardHeader className="pb-3 pt-4 border-b border-primary/10">
                <CardTitle className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1 h-4 bg-primary rounded-full" />
                  Schnellzugriff
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 flex-1 flex flex-col gap-2">
                {quickActions.map((action, i) => {
                  const variantMap: Record<string, "primary" | "secondary" | "ghost" | "destructive"> = {
                    default: "primary",
                    quickAction: "primary",
                    outline: "secondary",
                    ghost: "ghost",
                    destructive: "destructive",
                  }

                  // Render icon as ReactNode
                  const IconComponent = action.icon
                  const iconElement = IconComponent ? <IconComponent className="h-4 w-4" /> : undefined

                  return (
                    <V28Button
                      key={i}
                      variant={variantMap[action.variant || "quickAction"] || "primary"}
                      size="md"
                      onClick={action.onClick}
                      className="w-full rounded-none first:rounded-t-lg last:rounded-b-lg"
                      icon={iconElement}
                      iconPosition="left"
                    >
                      <span className="text-sm font-medium ml-3">{action.label}</span>
                    </V28Button>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
