import type React from "react"
import type { Metadata, Viewport } from "next"

export const metadata: Metadata = {
  title: "Fahrer-Portal | MyDispatch",
  description: "Fahrer-Portal fuer Auftraege, Schichten und mehr",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
}

export default function FahrerPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
