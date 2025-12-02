// Google Maps API Configuration
// API Key can be set via GOOGLE_MAPS_API_KEY environment variable
// API Key wird ueber Server-Route /api/maps/config bereitgestellt

const API_KEY = process.env.GOOGLE_MAPS_API_KEY || "AIzaSyBHoar8mdasmJ7jpbv5HCudrI5Jnt9H6A8"

export const GOOGLE_MAPS_CONFIG = {
  apiKey: API_KEY,
  isConfigured: true,
  libraries: ["places", "geometry", "drawing"] as const,
  defaultCenter: { lat: 52.52, lng: 13.405 }, // Berlin
  defaultZoom: 12,
  language: "de",
  region: "DE",
}

// Vehicle marker colors by status
export const VEHICLE_MARKER_COLORS = {
  available: "#22c55e", // green
  busy: "#f59e0b", // amber
  offline: "#6b7280", // gray
  maintenance: "#ef4444", // red
}

// Map styles
export const MAP_STYLES = {
  // Dark Mode Styles
  dark: [
    {
      featureType: "all",
      elementType: "geometry",
      stylers: [{ color: "#242f3e" }],
    },
    {
      featureType: "all",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#242f3e" }],
    },
    {
      featureType: "all",
      elementType: "labels.text.fill",
      stylers: [{ color: "#746855" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#38414e" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#212a37" }],
    },
  ],
  // Light Mode - Default Google Maps Style (empty array = no custom styles)
  light: [],
  // Default is now light mode
  default: [],
}
