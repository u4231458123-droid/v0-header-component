"use client"
import { V28Button } from "@/components/design-system/V28Button"
import { cn } from "@/lib/utils"
import { useDeviceType } from "@/hooks/use-device-type"

// Inline SVG Icon
function MessageCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
    </svg>
  )
}

interface HeaderAIChatButtonProps {
  onClick: () => void
  className?: string
}

export function HeaderAIChatButton({ onClick, className }: HeaderAIChatButtonProps) {
  const { isMobile } = useDeviceType()

  return (
    <V28Button
      variant="ghost"
      size={isMobile ? "sm" : "md"}
      onClick={onClick}
      className={cn(
        "relative group transition-all duration-200 p-0",
        "hover:bg-primary/10 hover:text-primary",
        isMobile ? "h-10 w-10" : "",
        className,
      )}
      aria-label="AI-Assistent öffnen"
      icon={isMobile ? () => <MessageCircleIcon className="h-5 w-5" /> : undefined}
    >
      {!isMobile && (
        <>
          <MessageCircleIcon className="h-5 w-5 mr-2" />
          <span className="font-medium">AI-Assistent</span>
        </>
      )}

      <span className="absolute top-0 right-0 flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
      </span>
    </V28Button>
  )
}
