import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { CookieBanner } from "@/components/shared/CookieBanner"
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MyDispatch - Professionelle Dispositions-Software",
  description:
    "Die moderne Dispositions-Software für Taxi, Mietwagen und Chauffeur-Unternehmen. Verwalten Sie Aufträge, Fahrer und Fahrzeuge effizient. Made in Germany.",
  generator: "v0.app",
  manifest: "/manifest.json",
  keywords: ["Dispositions-Software", "Taxi", "Mietwagen", "Chauffeur", "Flotten-Verwaltung", "Buchungs-System"],
  authors: [{ name: "RideHub Solutions UG" }],
  creator: "RideHub Solutions UG",
  publisher: "RideHub Solutions UG",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://my-dispatch.de"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "MyDispatch - Professionelle Dispositions-Software",
    description: "Die moderne Dispositions-Software für Taxi, Mietwagen und Chauffeur-Unternehmen.",
    url: "https://my-dispatch.de",
    siteName: "MyDispatch",
    locale: "de_DE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MyDispatch - Professionelle Dispositions-Software",
    description: "Die moderne Dispositions-Software für Taxi, Mietwagen und Chauffeur-Unternehmen.",
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "64x64", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MyDispatch",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#323D5E" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de">
      <head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="MyDispatch" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MyDispatch" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#323D5E" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Splash screens for iOS */}
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-2048-2732.png"
          media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-1668-2388.png"
          media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-1536-2048.png"
          media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-1125-2436.png"
          media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-1242-2688.png"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-750-1334.png"
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-640-1136.png"
          media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
      </head>
      <body className="font-sans antialiased">
        <ServiceWorkerRegistration />
        {children}
        <CookieBanner />
      </body>
    </html>
  )
}
