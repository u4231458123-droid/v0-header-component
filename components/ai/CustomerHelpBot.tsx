"use client"

import { ChatWidget } from "./ChatWidget"

export function CustomerHelpBot() {
  return <ChatWidget context="customer" title="Kunden-Support" subtitle="Hilfe zur Buchung" position="bottom-right" />
}
