import type { MetadataRoute } from "next"
import { getAllCitySlugs } from "@/lib/german-cities"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://my-dispatch.de"

  // Static pages
  const staticPages = [
    "",
    "/preise",
    "/fragen",
    "/kontakt",
    "/impressum",
    "/datenschutz",
    "/agb",
    "/nutzungsbedingungen",
    "/ki-vorschriften",
    "/auth/login",
    "/auth/sign-up",
    "/kunden-portal",
    "/fahrer-portal",
  ]

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : route === "/preise" ? 0.9 : 0.7,
  }))

  const citySlugs = getAllCitySlugs()
  const cityEntries: MetadataRoute.Sitemap = citySlugs.map((slug) => ({
    url: `${baseUrl}/stadt/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }))

  return [...staticEntries, ...cityEntries]
}
