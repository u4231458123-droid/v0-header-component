"use client"

import { ChatWidget } from "./ChatWidget"

export function DriverHelpBot() {
  return (
    <ChatWidget context="driver" title="Fahrer-Assistent" subtitle="Hilfe zum Fahrerportal" position="bottom-right" />
  )
}

// Default export für vereinfachten dynamic import
export default DriverHelpBot
