"use client"

import { toast as sonnerToast } from "sonner"

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

export function useToast() {
  return {
    toast: (props: { title?: string; description?: string; variant?: "default" | "destructive" }) => {
      if (props.variant === "destructive") {
        sonnerToast.error(props.title || props.description || "Fehler")
      } else {
        sonnerToast.success(props.title || props.description || "Erfolgreich")
      }
    },
  }
}

