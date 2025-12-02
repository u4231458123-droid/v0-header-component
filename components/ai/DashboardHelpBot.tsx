"use client"

import { ChatWidget } from "./ChatWidget"

export function DashboardHelpBot() {
  return (
    <ChatWidget
      context="dashboard"
      title="Dashboard-Hilfe"
      subtitle="Ich helfe bei allen Fragen"
      position="bottom-right"
    />
  )
}
