/* ==================================================================================
   LOGO COMPONENT - V28.1 Unified Logo System
   ==================================================================================
   Zentrale Logo-Komponente für konsistente Darstellung systemweit
   ================================================================================== */

import Image from "next/image"

interface LogoProps {
  className?: string
  alt?: string
}

export function Logo({ className = "h-8", alt = "MyDispatch - simply arrive" }: LogoProps) {
  return (
    <Image
      src="/images/mydispatch-3d-logo.png"
      alt={alt}
      width={200}
      height={50}
      className={className}
      priority
      style={{
        objectFit: "contain",
      }}
    />
  )
}
