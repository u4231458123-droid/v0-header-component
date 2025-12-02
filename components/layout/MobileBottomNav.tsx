"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { designTokens } from "@/config/design-tokens"
import type { CSSProperties } from "react"

interface IconProps {
  className?: string
  style?: CSSProperties
}

const HomeIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

const FileTextIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10 9H8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
  </svg>
)

const UsersIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const CarIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" />
    <path d="M9 17h6" />
    <circle cx="17" cy="17" r="2" />
  </svg>
)

const MoreHorizontalIcon = ({ className, style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
)

const navItems = [
  { label: "Home", url: "/dashboard", Icon: HomeIcon },
  { label: "Aufträge", url: "/auftraege", Icon: FileTextIcon },
  { label: "Kunden", url: "/kunden", Icon: UsersIcon },
  { label: "Fahrer", url: "/fahrer", Icon: CarIcon },
  { label: "Mehr", url: "/mobile-menu", Icon: MoreHorizontalIcon },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom"
      style={{
        height: "64px",
        backgroundColor: designTokens.colors.white,
        borderTop: `1px solid ${designTokens.colors.border.DEFAULT}`,
      }}
    >
      <div className="flex items-center justify-around h-full px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.url || (item.url === "/dashboard" && pathname === "/")
          const IconComponent = item.Icon

          return (
            <Link
              key={item.url}
              href={item.url}
              className={cn("flex flex-col items-center justify-center touch-manipulation", "transition-all")}
              style={{
                gap: designTokens.spacing.xs,
                padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
                borderRadius: designTokens.radius.md,
                minWidth: "60px",
                minHeight: "44px",
                backgroundColor: isActive ? `${designTokens.colors.slate[100]}` : "transparent",
                transitionDuration: designTokens.motion.duration.default,
              }}
            >
              <IconComponent
                className="transition-colors"
                style={{
                  width: "20px",
                  height: "20px",
                  color: isActive ? designTokens.colors.slate[900] : designTokens.colors.text.tertiary,
                }}
              />
              <span
                className="font-medium transition-colors"
                style={{
                  fontSize: "10px",
                  color: isActive ? designTokens.colors.slate[900] : designTokens.colors.text.tertiary,
                }}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
