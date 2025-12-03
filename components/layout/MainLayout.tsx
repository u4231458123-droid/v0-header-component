"use client"

/* ==================================================================================
   MainLayout V30.0 - OHNE SIDEBAR, NUR HEADER
   ==================================================================================
   - Sidebar entfernt
   - Header mit integriertem Menu
   - Mobile-freundlich
   - Dashboard AI Chatbot integriert
   ================================================================================== */

import type { ReactNode } from "react"
import { Header } from "./Header"
import { Footer } from "./Footer"
import { DashboardHelpBot } from "@/components/ai/DashboardHelpBot"
import { cn } from "@/lib/utils"

interface MainLayoutProps {
  children: ReactNode
  background?: "white" | "canvas" | "orbs-light"
}

export function MainLayout({ children, background = "canvas" }: MainLayoutProps) {
  const bgClass =
    background === "white"
      ? "bg-background"
      : background === "orbs-light"
        ? "bg-background relative overflow-hidden"
        : "bg-muted/30"

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main
        className={cn("flex-1 relative", bgClass)}
        style={{
          paddingTop: "88px", // Header height + spacing
          paddingBottom: "72px", // Footer height + spacing
        }}
      >
        {/* Floating Orbs (nur bei orbs-light) */}
        {background === "orbs-light" && (
          <>
            <div
              className="absolute top-[10%] right-[5%] w-[350px] h-[350px] bg-muted rounded-full blur-2xl opacity-20 pointer-events-none animate-pulse"
              style={{ animationDuration: "10s" }}
              aria-hidden="true"
            />
            <div
              className="absolute bottom-[15%] left-[5%] w-[300px] h-[300px] bg-muted rounded-full blur-2xl opacity-15 pointer-events-none animate-pulse"
              style={{ animationDuration: "15s", animationDelay: "3s" }}
              aria-hidden="true"
            />
          </>
        )}

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 min-h-full relative z-10">{children}</div>
      </main>

      <Footer />

      <DashboardHelpBot />
    </div>
  )
}

export default MainLayout
