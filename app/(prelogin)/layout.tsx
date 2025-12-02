import type React from "react"
import type { Metadata } from "next"
import "@/app/globals.css"

export const metadata: Metadata = {
  title: "MyDispatch - Professionelle Dispositions-Software",
  description: "Die moderne Dispositions-Software für Transport-Unternehmen.",
}

export default function PreLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
