/**
 * Shared Type Definitions für Page Templates
 */

import type React from "react"
import type { ComponentType, ReactNode } from "react"

export interface ActionConfig {
  label: string
  onClick: () => void
  icon?: ComponentType<{ className?: string }>
  variant?: "primary" | "secondary" | "ghost" | "danger" | "destructive" | "default"
  disabled?: boolean
  badge?: string | number
}

export interface BulkActionConfig {
  selectedCount: number
  onClear: () => void
  actions: Array<{
    label: string
    onClick: (selectedIds: string[]) => void
    icon?: ComponentType<{ className?: string }>
    variant?: "primary" | "secondary" | "danger"
  }>
}

export interface SearchConfig {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

// Tab configuration for FilterBar
export interface TabItemConfig {
  id: string
  value: string
  label: string
  count?: number
  icon?: ComponentType<{ className?: string }>
}

export interface TabConfig {
  value: string
  onChange: (value: string) => void
  tabs: TabItemConfig[]
}

// Filter configuration
export interface FilterOptionConfig {
  value: string
  label: string
}

export interface FilterConfig {
  id: string
  label: string
  options: FilterOptionConfig[]
  value?: string
  onChange: (value: string) => void
  component?: ReactNode
}

export interface FloatingActionConfig {
  icon: React.ReactNode
  label: string
  onClick: () => void
  variant?: "primary" | "secondary"
}

export interface ColumnConfig<T> {
  id?: string
  key: keyof T | string
  header: string
  render?: (item: T) => React.ReactNode
  cell?: (item: T) => React.ReactNode
  accessorKey?: keyof T
  className?: string
  width?: string | number
}

export interface EmptyStateConfig {
  icon?: ReactNode | ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: ActionConfig
}

export interface ContentConfig<T> {
  type: "table" | "grid" | "list" | "cards" | "custom" | "widgets"
  data: T[]
  columns?: ColumnConfig<T>[]
  renderItem?: (item: T, index: number) => React.ReactNode
  emptyState?: EmptyStateConfig
  onRowClick?: (item: T) => void
  customContent?: React.ReactNode
}

// KPI configuration for PageHeader
export interface KPIConfig {
  label: string
  value: string | number
  icon: ComponentType<{ className?: string }>
  trend?: {
    value: number
    isPositive: boolean
  }
}

// Badge configuration
export interface BadgeConfig {
  label: string
  variant?: "default" | "secondary" | "destructive" | "outline"
}

// Page Header configuration
export interface PageHeaderConfig {
  title: string
  description?: string
  icon?: ComponentType<{ className?: string }>
  kpis?: KPIConfig[]
  quickActions?: ActionConfig[]
  badges?: BadgeConfig[]
}

// Unified Page Template Props
export interface UnifiedPageTemplateProps<T = unknown> {
  // SEO
  title: string
  description?: string
  canonical?: string

  // Configuration
  header: PageHeaderConfig
  tabs?: TabConfig
  filters?: {
    search?: SearchConfig
    tabs?: TabConfig
    customFilters?: FilterConfig[]
    onSearchChange?: (value: string) => void
    onTabChange?: (value: string) => void
    onFilterChange?: (filterId: string, value: string) => void
  }
  search?: SearchConfig
  actions?: {
    primary?: ActionConfig[]
    secondary?: ActionConfig[]
    bulk?: BulkActionConfig
  }
  content: ContentConfig<T>
  floatingAction?: FloatingActionConfig
  floatingActions?: FloatingActionConfig[]
  selectedIds?: string[]
  onSelectionChange?: (ids: string[]) => void
  mobileComponent?: ReactNode
  isLoading?: boolean
  className?: string
}
