"use client"

import type { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"

interface FilterBarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  children?: ReactNode
  onReset?: () => void
  showReset?: boolean
}

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Suchen...",
  children,
  onReset,
  showReset = false,
}: FilterBarProps) {
  return (
    <Card className="rounded-2xl border-border">
      <CardContent className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:flex-1 sm:min-w-[300px] md:min-w-[400px] lg:min-w-[500px] xl:min-w-[600px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 rounded-xl w-full"
            />
          </div>
          {children}
          {showReset && onReset && (
            <Button variant="ghost" size="sm" onClick={onReset} className="gap-2">
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Zuruecksetzen</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
