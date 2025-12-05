"use client"

/* ==================================================================================
   MarketingLayout V21.0.0 - NO EXTERNAL ICONS (lucide-free)
   ==================================================================================
   - Uses inline SVG icons instead of lucide-react
   - Sidebar: 64px/240px (hover-expand) - DESKTOP ONLY
   - Mobile: Hamburger-Menu with Sheet
   - B2B-Tonality, Mobile-optimiert
   ================================================================================== */

import { type ReactNode, useState } from "react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useDeviceType } from "@/hooks/use-device-type"
import { V28CookieConsent } from "@/components/shared/V28CookieConsent"
import { DESIGN_TOKENS } from "@/lib/design-system/design-tokens"

const Icons = {
  Home: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  ),
  FileText: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  ),
  BookOpen: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  ),
  HelpCircle: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  Code: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  Mail: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  ),
  ChevronRight: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  Menu: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
}

interface MarketingLayoutProps {
  children: ReactNode
  currentPage?: string
  background?: "white" | "canvas" | "orbs-light"
}

export function MarketingLayout({ children, currentPage = "", background = "white" }: MarketingLayoutProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isMobile } = useDeviceType()
  const router = useRouter()

  const bgClass =
    background === "white"
      ? "bg-card"
      : background === "orbs-light"
        ? "bg-card relative overflow-hidden"
        : "bg-background"

  const marketingMenuItems = [
    { title: "Startseite", icon: Icons.Home, url: "/", page: "home" },
    { title: "Preise & Tarife", icon: Icons.FileText, url: "/preise", page: "pricing" },
    { title: "Dokumentation", icon: Icons.BookOpen, url: "/docs", page: "docs" },
    { title: "FAQ", icon: Icons.HelpCircle, url: "/fragen", page: "faq" },
    { title: "NeXify IT-Service", icon: Icons.Code, url: "/nexify-support", page: "nexify" },
    { title: "Kontakt", icon: Icons.Mail, url: "/kontakt", page: "contact" },
  ]

  const legalItems = [
    { title: "Impressum", url: "/impressum" },
    { title: "Datenschutz", url: "/datenschutz" },
    { title: "AGB", url: "/agb" },
    { title: "Nutzungsbedingungen", url: "/terms" },
    { title: "NeXify IT-Service", url: "/nexify-support" },
    { title: "Kontakt", url: "/kontakt" },
  ]

  return (
    <div className="min-h-screen flex bg-background overflow-x-hidden max-w-full">
      {!isMobile && (
        <aside
          className={cn(
            "fixed left-0 top-0 h-full bg-background z-40 flex flex-col shadow-sm border-r overflow-x-hidden",
            "transition-[width]",
            sidebarExpanded ? "w-60" : "w-[64px]",
          )}
          style={{
            borderColor: DESIGN_TOKENS.colors.border.DEFAULT,
            transitionDuration: DESIGN_TOKENS.motion.duration.slow,
            transitionTimingFunction: DESIGN_TOKENS.motion.timing.easeInOut,
          }}
          onMouseEnter={() => setSidebarExpanded(true)}
          onMouseLeave={() => setSidebarExpanded(false)}
        >
          <div className="h-16 flex items-center justify-center m-0 p-0">
            {!sidebarExpanded && (
              <button className="p-2 rounded-xl hover:bg-muted transition-colors">
                <Icons.ChevronRight />
              </button>
            )}
          </div>

          <nav
            className="flex-1 overflow-y-auto overflow-x-hidden"
            style={{
              padding: `${DESIGN_TOKENS.spacing.lg} ${DESIGN_TOKENS.spacing.md}`,
              margin: 0,
            }}
          >
            {marketingMenuItems.map((item) => {
              const IconComponent = item.icon
              const isActive = item.page === currentPage
              return (
                <Link
                  key={item.title}
                  href={item.url}
                  className={cn(
                    "flex items-center rounded-xl text-sm font-medium mb-1 transition-all",
                    !sidebarExpanded && "justify-center p-2",
                    sidebarExpanded && "px-3 py-2",
                    isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground hover:bg-muted",
                  )}
                  style={{
                    gap: DESIGN_TOKENS.spacing.md,
                  }}
                >
                  <IconComponent />
                  {sidebarExpanded && <span className="truncate whitespace-nowrap">{item.title}</span>}
                </Link>
              )
            })}
          </nav>

          <div
            className={cn("transition-opacity", sidebarExpanded ? "opacity-100" : "opacity-0")}
            style={{
              padding: `${DESIGN_TOKENS.spacing.lg} ${DESIGN_TOKENS.spacing.md}`,
              borderTop: `1px solid ${DESIGN_TOKENS.colors.border.DEFAULT}`,
              transitionDuration: DESIGN_TOKENS.motion.duration.slow,
            }}
          >
            {sidebarExpanded && (
              <>
                <h3
                  className="uppercase tracking-wider"
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    color: DESIGN_TOKENS.colors.text.tertiary,
                    marginBottom: DESIGN_TOKENS.spacing.md,
                    paddingLeft: DESIGN_TOKENS.spacing.md,
                  }}
                >
                  Rechtliches
                </h3>
                <nav className="flex flex-col gap-1">
                  {legalItems.map((item) => (
                    <Link
                      key={item.title}
                      href={item.url}
                      className="px-3 py-1 text-xs text-muted-foreground rounded-sm hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                      {item.title}
                    </Link>
                  ))}
                </nav>
              </>
            )}
          </div>
        </aside>
      )}

      <div className={cn("flex-1 overflow-x-hidden", isMobile ? "ml-0" : "")}>
        <header
          className={cn("fixed top-0 z-30 bg-background", isMobile ? "left-0 right-0 w-full" : "right-0")}
          style={
            !isMobile
              ? {
                  left: sidebarExpanded ? "240px" : "64px",
                  width: sidebarExpanded ? "calc(100% - 240px)" : "calc(100% - 64px)",
                  boxShadow: DESIGN_TOKENS.elevation.sm,
                  borderBottom: `1px solid ${DESIGN_TOKENS.colors.border.DEFAULT}`,
                  transition: `left ${DESIGN_TOKENS.motion.duration.slow} ${DESIGN_TOKENS.motion.timing.easeInOut}, width ${DESIGN_TOKENS.motion.duration.slow} ${DESIGN_TOKENS.motion.timing.easeInOut}`,
                }
              : {
                  boxShadow: DESIGN_TOKENS.elevation.sm,
                  borderBottom: `1px solid ${DESIGN_TOKENS.colors.border.DEFAULT}`,
                }
          }
        >
          <div className="px-6 pl-8">
            <div className="flex items-center justify-between" style={{ height: "64px" }}>
              {isMobile && (
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="h-9 w-9 p-0 shrink-0 text-foreground flex items-center justify-center rounded-xl hover:bg-muted"
                  aria-label="Menü öffnen"
                >
                  <Icons.Menu />
                </button>
              )}

              <Image
                src="/images/mydispatch-3d-logo.png"
                alt="MyDispatch - simply arrive"
                width={200}
                height={50}
                onClick={() => router.push("/")}
                className="h-9 w-auto max-w-[140px] sm:max-w-[180px] md:max-w-[200px] object-contain drop-shadow-sm cursor-pointer hover:opacity-80"
                style={{
                  transition: `opacity ${DESIGN_TOKENS.motion.duration.default} ${DESIGN_TOKENS.motion.timing.easeInOut}`,
                }}
              />

              <div className="flex items-center gap-5">
                {!isMobile && (
                  <button
                    onClick={() => router.push("/auth/sign-up")}
                    className="h-10 px-4 font-medium text-sm hover:bg-muted transition-all rounded-xl"
                  >
                    Starten
                  </button>
                )}
                <button
                  onClick={() => router.push("/auth/login")}
                  className="h-10 px-6 font-semibold text-sm rounded-xl bg-primary text-primary-foreground border border-primary shadow-sm hover:bg-primary/90 hover:scale-[1.02] hover:shadow-md transition-all"
                >
                  Anmelden
                </button>
              </div>
            </div>
          </div>
        </header>

        <main
          className={cn("min-h-screen overflow-x-hidden relative", bgClass, isMobile ? "pt-14 pb-0" : "pt-16 pb-0")}
        >
          {background === "orbs-light" && (
            <>
              <div
                className="absolute top-[10%] right-[5%] w-[350px] h-[350px] bg-muted rounded-full blur-2xl opacity-20 pointer-events-none animate-pulse"
                style={{ animationDuration: "10s" }}
                aria-hidden="true"
              />
              <div
                className="absolute bottom-[15%] left-[5%] w-[300px] h-[300px] bg-muted/80 rounded-full blur-2xl opacity-15 pointer-events-none animate-pulse"
                style={{ animationDuration: "15s", animationDelay: "3s" }}
                aria-hidden="true"
              />
            </>
          )}

          <div className="relative z-10 min-h-full">{children}</div>
        </main>

        <footer
          className={cn("fixed bottom-0 z-20 bg-background py-1", isMobile ? "left-0 right-0 w-full" : "right-0")}
          style={
            !isMobile
              ? {
                  left: sidebarExpanded ? "240px" : "64px",
                  width: sidebarExpanded ? "calc(100% - 240px)" : "calc(100% - 64px)",
                  borderTop: `1px solid ${DESIGN_TOKENS.colors.border.DEFAULT}`,
                  transition: `left ${DESIGN_TOKENS.motion.duration.slow} ${DESIGN_TOKENS.motion.timing.easeInOut}, width ${DESIGN_TOKENS.motion.duration.slow} ${DESIGN_TOKENS.motion.timing.easeInOut}`,
                }
              : {
                  borderTop: `1px solid ${DESIGN_TOKENS.colors.border.DEFAULT}`,
                }
          }
        >
          <div className="container mx-auto px-6 pl-8">
            {isMobile ? (
              <div className="flex flex-col items-center gap-2">
                <p
                  className="font-medium"
                  style={{
                    fontSize: "10px",
                    color: DESIGN_TOKENS.colors.text.secondary,
                  }}
                >
                  © 2025 my-dispatch.de by RideHub Solutions
                </p>
                <div className="flex items-center gap-5">
                  <Link
                    href="/impressum"
                    className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Impressum
                  </Link>
                  <span className="text-[10px] text-border">•</span>
                  <Link
                    href="/datenschutz"
                    className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Datenschutz
                  </Link>
                  <span className="text-[10px] text-border">•</span>
                  <Link
                    href="/kontakt"
                    className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Kontakt
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <p
                    className="font-medium"
                    style={{
                      fontSize: "12px",
                      color: DESIGN_TOKENS.colors.text.secondary,
                    }}
                  >
                    © 2025 my-dispatch.de by RideHub Solutions
                  </p>
                  <span style={{ fontSize: "12px", color: DESIGN_TOKENS.colors.border.DEFAULT }}>•</span>
                  <span style={{ fontSize: "12px", color: DESIGN_TOKENS.colors.text.tertiary }}>Made in Germany</span>
                </div>
                <div className="flex items-center gap-5">
                  {["Impressum", "Datenschutz", "AGB", "Kontakt"].map((label) => (
                    <Link
                      key={label}
                      href={`/${label.toLowerCase()}`}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </footer>
      </div>

      {isMobile && (
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-72 p-0 bg-background border-r border-border">
            <SheetHeader className="p-6 pb-4 border-b border-border">
              <SheetTitle className="text-foreground">Navigation</SheetTitle>
            </SheetHeader>

            <nav
              className="flex-1 overflow-y-auto"
              style={{
                padding: `${DESIGN_TOKENS.spacing.lg} ${DESIGN_TOKENS.spacing.md}`,
              }}
            >
              {marketingMenuItems.map((item) => {
                const IconComponent = item.icon
                const isActive = item.page === currentPage
                return (
                  <Link
                    key={item.title}
                    href={item.url}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 mb-1 rounded-xl text-sm font-medium transition-all",
                      isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted",
                    )}
                  >
                    <IconComponent />
                    <span>{item.title}</span>
                  </Link>
                )
              })}
            </nav>

            <div
              style={{
                padding: `${DESIGN_TOKENS.spacing.lg} ${DESIGN_TOKENS.spacing.md}`,
                borderTop: `1px solid ${DESIGN_TOKENS.colors.border.DEFAULT}`,
              }}
            >
              <h3
                className="uppercase tracking-wider"
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  color: DESIGN_TOKENS.colors.text.tertiary,
                  marginBottom: DESIGN_TOKENS.spacing.md,
                  paddingLeft: DESIGN_TOKENS.spacing.md,
                }}
              >
                Rechtliches
              </h3>
              <nav className="flex flex-col gap-1">
                {legalItems.map((item) => (
                  <Link
                    key={item.title}
                    href={item.url}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-1 text-xs text-muted-foreground rounded-sm hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    {item.title}
                  </Link>
                ))}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      )}

      <V28CookieConsent />
    </div>
  )
}
