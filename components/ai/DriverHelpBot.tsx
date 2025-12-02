"use client"

import { ChatWidget } from "./ChatWidget"

export function DriverHelpBot() {
  return (
    <ChatWidget context="driver" title="Fahrer-Assistent" subtitle="Hilfe zum Fahrerportal" position="bottom-right" />
  )
}
