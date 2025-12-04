"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { createPortal } from "react-dom"

export interface GeocodingResult {
  formattedAddress: string
  lat: number
  lng: number
  placeId?: string
  components?: {
    street?: string
    streetNumber?: string
    city?: string
    postalCode?: string
    country?: string
    state?: string
  }
}

interface AutocompleteResult {
  placeId: string
  description: string
  mainText: string
  secondaryText: string
}

async function getAutocompleteSuggestions(input: string, sessionToken?: string): Promise<AutocompleteResult[]> {
  if (!input || input.length < 3) return []

  try {
    const params = new URLSearchParams({ input })
    if (sessionToken) {
      params.append("sessiontoken", sessionToken)
    }

    const response = await fetch(`/api/maps/autocomplete?${params}`)
    const data = await response.json()

    if (data.status !== "OK" || !data.predictions) {
      return []
    }

    return data.predictions.map((prediction: any) => ({
      placeId: prediction.place_id,
      description: prediction.description,
      mainText: prediction.structured_formatting?.main_text || prediction.description,
      secondaryText: prediction.structured_formatting?.secondary_text || "",
    }))
  } catch (error) {
    console.error("Autocomplete error:", error)
    return []
  }
}

async function getPlaceDetails(placeId: string): Promise<GeocodingResult | null> {
  try {
    const response = await fetch(`/api/maps/place-details?place_id=${encodeURIComponent(placeId)}`)
    const data = await response.json()

    if (data.status !== "OK" || !data.result) {
      return null
    }

    const result = data.result
    const components: GeocodingResult["components"] = {}

    result.address_components?.forEach((component: any) => {
      if (component.types.includes("route")) {
        components.street = component.long_name
      }
      if (component.types.includes("street_number")) {
        components.streetNumber = component.long_name
      }
      if (component.types.includes("locality")) {
        components.city = component.long_name
      }
      if (component.types.includes("postal_code")) {
        components.postalCode = component.long_name
      }
      if (component.types.includes("country")) {
        components.country = component.long_name
      }
      if (component.types.includes("administrative_area_level_1")) {
        components.state = component.long_name
      }
    })

    return {
      formattedAddress: result.formatted_address,
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      placeId,
      components,
    }
  } catch (error) {
    console.error("Place details error:", error)
    return null
  }
}

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelect?: (result: GeocodingResult) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  required?: boolean
  id?: string
  name?: string
}

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Adresse eingeben...",
  className = "",
  disabled = false,
  required = false,
  id,
  name,
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value)
  const [suggestions, setSuggestions] = useState<AutocompleteResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const [mounted, setMounted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const sessionTokenRef = useRef<string>("")

  useEffect(() => {
    setInputValue(value)
  }, [value])

  useEffect(() => {
    setMounted(true)
    sessionTokenRef.current = crypto.randomUUID()
  }, [])

  const updateDropdownPosition = useCallback(() => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      })
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition()
      window.addEventListener("scroll", updateDropdownPosition, true)
      window.addEventListener("resize", updateDropdownPosition)
      return () => {
        window.removeEventListener("scroll", updateDropdownPosition, true)
        window.removeEventListener("resize", updateDropdownPosition)
      }
    }
  }, [isOpen, updateDropdownPosition])

  const fetchSuggestions = useCallback(async (input: string) => {
    if (input.length < 3) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    setLoading(true)
    const results = await getAutocompleteSuggestions(input, sessionTokenRef.current)
    setSuggestions(results)
    setIsOpen(results.length > 0)
    setLoading(false)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange(newValue)
    setSelectedIndex(-1)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(newValue)
    }, 300)
  }

  const handleSelect = async (suggestion: AutocompleteResult) => {
    setLoading(true)
    setIsOpen(false)

    const details = await getPlaceDetails(suggestion.placeId)

    if (details) {
      // Update both internal and external state with the formatted address
      setInputValue(details.formattedAddress)
      onChange(details.formattedAddress)
      onSelect?.(details)
    } else {
      // Fallback to description if details fetch fails
      setInputValue(suggestion.description)
      onChange(suggestion.description)
    }

    setSuggestions([])
    setLoading(false)
    sessionTokenRef.current = crypto.randomUUID()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, 0))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelect(suggestions[selectedIndex])
        }
        break
      case "Escape":
        setIsOpen(false)
        setSelectedIndex(-1)
        break
    }
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  const dropdownContent = isOpen && mounted && suggestions.length > 0 && (
    <div
      style={{
        position: "fixed",
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        width: dropdownPosition.width,
        zIndex: 99999,
      }}
      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl max-h-60 overflow-auto"
    >
      {loading ? (
        <div className="px-3 py-2 text-sm text-zinc-500">Suche...</div>
      ) : (
        suggestions.map((suggestion, index) => (
          <button
            key={suggestion.placeId}
            type="button"
            onClick={() => handleSelect(suggestion)}
            onMouseEnter={() => setSelectedIndex(index)}
            className={`w-full px-3 py-2 text-left text-sm transition-colors ${
              index === selectedIndex
                ? "bg-primary text-primary-foreground"
                : "text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <div className="font-medium">{suggestion.mainText}</div>
            <div className={`text-xs ${index === selectedIndex ? "text-primary-foreground/80" : "text-zinc-500"}`}>
              {suggestion.secondaryText}
            </div>
          </button>
        ))
      )}
    </div>
  )

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          id={id}
          name={name}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            updateDropdownPosition()
            if (suggestions.length > 0) setIsOpen(true)
          }}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full px-3 py-2 pr-10 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
          autoComplete="off"
        />
        {loading ? (
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
      </div>

      {mounted && typeof document !== "undefined" && createPortal(dropdownContent, document.body)}
    </div>
  )
}
