"use client"

import { useDeviceType } from "@/hooks/use-device-type"
import { usePathname } from "next/navigation"
import Link from "next/link"

// Inline SVG Icons
function HomeIcon({ className }: { className?: string }) {
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
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function ChevronRightIcon({ className }: { className?: string }) {
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
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

export function DashboardBreadcrumb() {
  const { isMobile } = useDeviceType()
  const pathname = usePathname()

  if (isMobile) {
    return null
  }

  const pathSegments = pathname.split("/").filter(Boolean)
  const currentPage = pathSegments[pathSegments.length - 1] || "dashboard"

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
      <Link href="/dashboard" className="hover:text-foreground transition-colors">
        <HomeIcon className="h-4 w-4" />
      </Link>
      <ChevronRightIcon className="h-4 w-4" />
      <span className="text-foreground font-medium capitalize">{currentPage}</span>
    </div>
  )
}
