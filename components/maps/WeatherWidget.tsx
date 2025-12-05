"use client"

import { useState, useEffect } from "react"
import { GOOGLE_MAPS_CONFIG } from "@/lib/google-maps/config"
import type { JSX } from "react"

interface WeatherData {
  temperature: number
  description: string
  icon: string
  humidity: number
  windSpeed: number
  city: string
  sunrise: string
  sunset: string
}

interface WeatherWidgetProps {
  lat?: number
  lng?: number
  city?: string
  className?: string
  compact?: boolean
}

const weatherIcons: Record<string, JSX.Element> = {
  "01d": // Clear sky day
    (
      <svg className="w-8 h-8 text-warning" fill="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="5" />
        <path
          d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
      </svg>
    ),
  "01n": // Clear sky night
    (
      <svg className="w-8 h-8 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </svg>
    ),
  "02d": // Few clouds day
    (
      <svg className="w-8 h-8 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
        <circle cx="8" cy="8" r="4" className="text-warning" />
        <path
          d="M18 10h.01M6 14a4 4 0 014-4h4a4 4 0 010 8H8a4 4 0 01-2-7.46"
          stroke="currentColor"
          strokeWidth="2"
          fill="white"
        />
      </svg>
    ),
  "03d": // Scattered clouds
    (
      <svg className="w-8 h-8 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
        <path d="M6 14a4 4 0 014-4h4a4 4 0 010 8H8a4 4 0 01-2-7.46" />
      </svg>
    ),
  "04d": // Broken clouds
    (
      <svg className="w-8 h-8 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
        <path d="M6 14a4 4 0 014-4h4a4 4 0 010 8H8a4 4 0 01-2-7.46" />
      </svg>
    ),
  "09d": // Shower rain
    (
      <svg className="w-8 h-8 text-info" fill="currentColor" viewBox="0 0 24 24">
        <path d="M6 14a4 4 0 014-4h4a4 4 0 010 8H8a4 4 0 01-2-7.46" className="text-muted-foreground" />
        <path d="M8 19v2M12 19v2M16 19v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  "10d": // Rain
    (
      <svg className="w-8 h-8 text-info" fill="currentColor" viewBox="0 0 24 24">
        <path d="M6 14a4 4 0 014-4h4a4 4 0 010 8H8a4 4 0 01-2-7.46" className="text-muted-foreground" />
        <path d="M8 19v3M12 19v3M16 19v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  "11d": // Thunderstorm
    (
      <svg className="w-8 h-8 text-warning" fill="currentColor" viewBox="0 0 24 24">
        <path d="M6 14a4 4 0 014-4h4a4 4 0 010 8H8a4 4 0 01-2-7.46" className="text-muted-foreground" />
        <path d="M13 17l-2 4h4l-2 4" stroke="currentColor" strokeWidth="2" fill="none" />
      </svg>
    ),
  "13d": // Snow
    (
      <svg className="w-8 h-8 text-info" fill="currentColor" viewBox="0 0 24 24">
        <path d="M6 14a4 4 0 014-4h4a4 4 0 010 8H8a4 4 0 01-2-7.46" className="text-muted-foreground" />
        <circle cx="8" cy="20" r="1" />
        <circle cx="12" cy="19" r="1" />
        <circle cx="16" cy="21" r="1" />
      </svg>
    ),
  "50d": // Mist
    (
      <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 12h16M4 16h12" />
      </svg>
    ),
}

export function WeatherWidget({ lat, lng, city = "Berlin", className = "", compact = false }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  // Fetch weather data
  useEffect(() => {
    async function fetchWeather() {
      setLoading(true)
      setError(null)

      try {
        // Use Open-Meteo API (free, no API key required)
        const coords = lat && lng ? { lat, lng } : GOOGLE_MAPS_CONFIG.defaultCenter

        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=sunrise,sunset&timezone=Europe/Berlin`,
        )

        if (!response.ok) throw new Error("Weather data fetch failed")

        const data = await response.json()

        // Map Open-Meteo weather codes to icons
        const weatherCode = data.current.weather_code
        const isDay = new Date().getHours() > 6 && new Date().getHours() < 20
        const iconKey = getWeatherIcon(weatherCode, isDay)

        setWeather({
          temperature: Math.round(data.current.temperature_2m),
          description: getWeatherDescription(weatherCode),
          icon: iconKey,
          humidity: data.current.relative_humidity_2m,
          windSpeed: Math.round(data.current.wind_speed_10m),
          city: city,
          sunrise: data.daily.sunrise[0].split("T")[1],
          sunset: data.daily.sunset[0].split("T")[1],
        })
      } catch (err) {
        console.error("[v0] Weather fetch error:", err)
        setError("Wetter konnte nicht geladen werden")
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
    // Refresh every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [lat, lng, city])

  function getWeatherIcon(code: number, isDay: boolean): string {
    const suffix = isDay ? "d" : "n"
    if (code === 0) return `01${suffix}`
    if (code <= 3) return `02${suffix}`
    if (code <= 48) return `50${suffix}`
    if (code <= 57) return `09${suffix}`
    if (code <= 67) return `10${suffix}`
    if (code <= 77) return `13${suffix}`
    if (code <= 82) return `09${suffix}`
    if (code <= 86) return `13${suffix}`
    if (code >= 95) return `11${suffix}`
    return `03${suffix}`
  }

  function getWeatherDescription(code: number): string {
    if (code === 0) return "Klar"
    if (code <= 3) return "Teilweise bewölkt"
    if (code <= 48) return "Nebelig"
    if (code <= 57) return "Nieselregen"
    if (code <= 67) return "Regen"
    if (code <= 77) return "Schnee"
    if (code <= 82) return "Regenschauer"
    if (code <= 86) return "Schneeschauer"
    if (code >= 95) return "Gewitter"
    return "Bewölkt"
  }

  if (loading) {
    return (
      <div className={`bg-card border border-border rounded-xl p-4 ${className}`}>
        <div className="animate-pulse flex items-center gap-5">
          <div className="w-12 h-12 bg-muted rounded-full" />
          <div className="space-y-2">
            <div className="h-6 w-20 bg-muted rounded" />
            <div className="h-4 w-16 bg-muted rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !weather) {
    return (
      <div className={`bg-card border border-border rounded-xl p-4 ${className}`}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>{error || "Wetter nicht verfügbar"}</span>
        </div>
      </div>
    )
  }

  if (compact) {
    return (
      <div className={`bg-card border border-border rounded-xl p-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {weatherIcons[weather.icon] || weatherIcons["03d"]}
            <div>
              <div className="text-2xl font-bold text-foreground">{weather.temperature}°C</div>
              <div className="text-xs text-muted-foreground">{weather.description}</div>
            </div>
          </div>
          <div className="text-right text-sm">
            <div className="font-medium text-foreground">{weather.city}</div>
            <div className="text-xs text-muted-foreground">
              {currentTime.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-card border border-border rounded-xl p-4 ${className}`}>
      {/* Header with city and time */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg text-foreground">{weather.city}</h3>
          <p className="text-sm text-muted-foreground">
            {currentTime.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-foreground">
            {currentTime.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </div>

      {/* Main weather display */}
      <div className="flex items-center gap-5 mb-4">
        {weatherIcons[weather.icon] || weatherIcons["03d"]}
        <div>
          <div className="text-4xl font-bold text-foreground">{weather.temperature}°C</div>
          <div className="text-sm text-muted-foreground">{weather.description}</div>
        </div>
      </div>

      {/* Additional info */}
      <div className="grid grid-cols-2 gap-5 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
            />
          </svg>
          <span className="text-sm text-muted-foreground">{weather.humidity}% Luftfeuchtigkeit</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          <span className="text-sm text-muted-foreground">{weather.windSpeed} km/h Wind</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-warning" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="5" />
          </svg>
          <span className="text-sm text-muted-foreground">Aufgang: {weather.sunrise}</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-warning" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
          <span className="text-sm text-muted-foreground">Untergang: {weather.sunset}</span>
        </div>
      </div>
    </div>
  )
}
