"use client"

import type React from "react"

import { useState } from "react"

export interface QuickAction {
  label: string
  icon: string
  onClick: () => void
}

export interface RecentActivity {
  id: string
  title: string
  time: string
  type: string
}

export interface ContextWidget {
  title: string
  content: React.ReactNode
}

export interface QuickActionsConfig {
  enabled: boolean
  quickActions: QuickAction[]
  recentActivities: RecentActivity[]
  contextWidget?: ContextWidget
}

export function useQuickActionsPanel() {
  const [config] = useState<QuickActionsConfig>({
    enabled: false,
    quickActions: [],
    recentActivities: [],
  })

  return { config }
}
