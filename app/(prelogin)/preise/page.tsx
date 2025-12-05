import type { Metadata } from "next"
import { PreisePageClient } from "./PreisePageClient"

export const metadata: Metadata = {
  title: "Preise - MyDispatch Dispositions-Software",
  description:
    "Transparente Preise für die MyDispatch Dispositions-Software. Starter, Professional und Enterprise Tarife. Monatlich kündbar, keine Einrichtungsgebühr.",
  keywords: ["Preise", "Tarife", "Kosten", "Dispositions-Software", "Taxi-Software", "Mietwagen-Software"],
  openGraph: {
    title: "Preise - MyDispatch Dispositions-Software",
    description: "Transparente Preise für die MyDispatch Dispositions-Software. Starter, Professional und Enterprise Tarife.",
    url: "https://my-dispatch.de/preise",
  },
  twitter: {
    card: "summary_large_image",
    title: "Preise - MyDispatch Dispositions-Software",
    description: "Transparente Preise für die MyDispatch Dispositions-Software.",
  },
  alternates: {
    canonical: "/preise",
  },
}

export default function PreisePage() {
  return <PreisePageClient />
}
