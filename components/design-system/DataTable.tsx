"use client"

import type { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface DataTableProps {
  title?: string
  description?: string
  columns: { key: string; label: string; className?: string }[]
  children: ReactNode
  emptyMessage?: string
  isEmpty?: boolean
  headerActions?: ReactNode
}

export function DataTable({
  title,
  description,
  columns,
  children,
  emptyMessage = "Keine Daten vorhanden",
  isEmpty = false,
  headerActions,
}: DataTableProps) {
  return (
    <Card className="rounded-2xl border-border overflow-hidden">
      {(title || headerActions) && (
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              {title && <CardTitle className="text-lg">{title}</CardTitle>}
              {description && <CardDescription>{description}</CardDescription>}
            </div>
            {headerActions}
          </div>
        </CardHeader>
      )}
      <CardContent className={title ? "pt-0" : "p-0"}>
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                {columns.map((col) => (
                  <TableHead key={col.key} className={`font-semibold ${col.className || ""}`}>
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isEmpty ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                children
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
