/**
 * SYSTEMWEITES LOGO
 * =================
 * UI-Library-Komponente für systemweite Verwendung
 * NIEMALS duplizieren oder abweichen
 * 
 * Logik: company.logo_url || "/images/mydispatch-3d-logo.png"
 * Standard: MyDispatch 3D-Logo (mydispatch-3d-logo.png)
 */

"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

export interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
  companyLogoUrl?: string | null
  alt?: string
}

export function Logo({ 
  className, 
  size = "md",
  companyLogoUrl,
  alt = "MyDispatch - simply arrive"
}: LogoProps) {
  // Standard: MyDispatch 3D-Logo, Fallback zu Company-Logo wenn vorhanden
  const logoUrl = companyLogoUrl || "/images/mydispatch-3d-logo.png"
  
  const sizeClasses = {
    sm: "h-8 w-auto",
    md: "h-10 w-auto",
    lg: "h-12 w-auto",
  }

  const dimensions = {
    sm: { width: 160, height: 40 },
    md: { width: 200, height: 50 },
    lg: { width: 240, height: 60 },
  }

  return (
    <div className={cn("flex items-center", className)}>
      <Image
        src={logoUrl}
        alt={alt}
        width={dimensions[size].width}
        height={dimensions[size].height}
        className={cn(sizeClasses[size], "object-contain")}
        priority
        unoptimized
        style={{
          objectFit: "contain",
        }}
      />
    </div>
  )
}

