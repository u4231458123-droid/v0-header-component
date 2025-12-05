"use client"

/* ==================================================================================
   CONTENT AREA COMPONENT - V18.3.24 ULTIMATE
   ==================================================================================
   Flexible Content-Anzeige mit Multiple Layouts
   - Table View (DataTable)
   - Grid View (Responsive Grid)
   - Cards View (Vertical Stack)
   - Widgets View (Dashboard Grid)
   - Custom Content
   ================================================================================== */

import { EmptyState } from "@/components/shared/EmptyState"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { ContentConfig } from "@/types/page-template"
import type { ComponentType, ReactNode } from "react"

interface ContentAreaProps<T = any> extends ContentConfig<T> {}

export function ContentArea<T = any>({
  type,
  data,
  columns,
  renderItem,
  emptyState,
  onRowClick,
  customContent,
}: ContentAreaProps<T>) {
  // Empty State
  if (data.length === 0 && emptyState) {
    // Handle icon - can be ComponentType or ReactNode
    let iconElement: ReactNode = null
    if (emptyState.icon) {
      if (typeof emptyState.icon === "function") {
        const IconComponent = emptyState.icon as ComponentType<{ className?: string }>
        iconElement = <IconComponent className="h-16 w-16" />
      } else {
        iconElement = emptyState.icon
      }
    }

    return (
      <EmptyState
        icon={iconElement}
        title={emptyState.title}
        description={emptyState.description}
        action={emptyState.action ? {
          label: emptyState.action.label,
          onClick: emptyState.action.onClick,
        } : undefined}
      />
    )
  }

  // Custom Content (höchste Priorität)
  if (type === "custom" && customContent) {
    return <>{customContent}</>
  }

  // Table View
  if (type === "table" && columns && columns.length > 0) {
    return (
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col, idx) => (
                <TableHead key={col.id || col.key?.toString() || idx} style={col.width ? { width: col.width } : undefined}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, rowIndex) => (
              <TableRow
                key={rowIndex}
                onClick={() => onRowClick?.(item)}
                className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
              >
                {columns.map((col, colIdx) => (
                  <TableCell key={col.id || col.key?.toString() || colIdx}>
                    {col.cell
                      ? col.cell(item)
                      : col.render
                        ? col.render(item)
                        : col.accessorKey
                          ? String((item as Record<string, unknown>)[col.accessorKey as string] ?? "-")
                          : col.key
                            ? String((item as Record<string, unknown>)[col.key as string] ?? "-")
                            : "-"}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  // Grid View (3 Columns auf Desktop)
  if (type === "grid" && renderItem) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {data.map((item, i) => (
          <div key={i}>{renderItem(item, i)}</div>
        ))}
      </div>
    )
  }

  // Cards View (Vertical Stack)
  if (type === "cards" && renderItem) {
    return (
      <div className="space-y-4">
        {data.map((item, i) => (
          <div key={i}>{renderItem(item, i)}</div>
        ))}
      </div>
    )
  }

  // Widgets View (Dashboard Grid)
  if (type === "widgets" && renderItem) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {data.map((item, i) => (
          <div key={i}>{renderItem(item, i)}</div>
        ))}
      </div>
    )
  }

  // Fallback: Simple List
  return (
    <div className="space-y-2">
      {data.map((item, i) => (
        <div key={i} className="p-4 rounded-xl border border-border bg-card">
          {JSON.stringify(item)}
        </div>
      ))}
    </div>
  )
}
