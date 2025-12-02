"use client"

import { ChatWidget } from "@/components/ai/ChatWidget"

interface V28ChatWidgetProps {
  context?: "lead" | "dashboard" | "driver" | "customer"
  title?: string
  subtitle?: string
}

export function V28ChatWidget({
  context = "lead",
  title = "MyDispatch AI",
  subtitle = "Wie kann ich helfen?"
}: V28ChatWidgetProps) {
  return (
    <ChatWidget
      context={context}
      title={title}
      subtitle={subtitle}
      position="bottom-right"
    />
  )
}
