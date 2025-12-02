"use client"

import { Input } from "@/lib/compat"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import type { SearchConfig, TabItemConfig, FilterConfig } from "@/types/page-template"

// Inline SVG Icon
function SearchIcon({ className }: { className?: string }) {
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
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

interface FilterBarProps {
  search?: SearchConfig
  tabs?: TabItemConfig[]
  customFilters?: FilterConfig[]
  onSearchChange?: (value: string) => void
  onTabChange?: (tabId: string) => void
  onFilterChange?: (filters: Record<string, unknown>) => void
}

export function FilterBar({ search, tabs, customFilters, onSearchChange, onTabChange }: FilterBarProps) {
  if (!search && (!tabs || tabs.length === 0) && (!customFilters || customFilters.length === 0)) {
    return null
  }

  return (
    <div className="space-y-4">
      {search && (
        <div className="relative w-full sm:max-w-none sm:min-w-[300px] md:min-w-[400px] lg:min-w-[500px] xl:min-w-[600px]">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={search.placeholder}
            value={search.value}
            onChange={(e) => {
              search.onChange?.(e.target.value)
              onSearchChange?.(e.target.value)
            }}
            className="pl-10 w-full"
          />
        </div>
      )}

      {tabs && tabs.length > 0 && (
        <Tabs defaultValue={tabs[0].id} onValueChange={onTabChange} className="w-full">
          <TabsList className="w-full justify-start flex-wrap h-auto">
            {tabs.map((tab) => {
              const IconComponent = tab.icon
              return (
                <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
                  {IconComponent && <IconComponent className="h-4 w-4" />}
                  {tab.label}
                  {tab.count !== undefined && (
                    <Badge variant="secondary" className="ml-2">
                      {tab.count}
                    </Badge>
                  )}
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>
      )}

      {customFilters && customFilters.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {customFilters.map((filter) => (
            <div key={filter.id}>
              {filter.component || <div className="text-sm text-muted-foreground">Filter: {filter.label}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
