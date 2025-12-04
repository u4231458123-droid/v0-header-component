"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface AccordionContextValue {
  value: string | string[] | undefined
  onValueChange: (value: string | string[]) => void
  type: "single" | "multiple"
  collapsible: boolean
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null)

function useAccordion() {
  const context = React.useContext(AccordionContext)
  if (!context) {
    throw new Error("useAccordion must be used within an Accordion")
  }
  return context
}

interface AccordionProps {
  type?: "single" | "multiple"
  defaultValue?: string | string[]
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
  collapsible?: boolean
  children: React.ReactNode
  className?: string
}

function Accordion({
  type = "single",
  defaultValue,
  value: controlledValue,
  onValueChange,
  collapsible = false,
  children,
  className,
}: AccordionProps) {
  const [internalValue, setInternalValue] = React.useState<string | string[] | undefined>(
    defaultValue || (type === "multiple" ? [] : undefined)
  )

  const value = controlledValue ?? internalValue

  const handleValueChange = (newValue: string | string[]) => {
    setInternalValue(newValue)
    onValueChange?.(newValue)
  }

  return (
    <AccordionContext.Provider value={{ value, onValueChange: handleValueChange, type, collapsible }}>
      <div className={cn("w-full", className)}>{children}</div>
    </AccordionContext.Provider>
  )
}

interface AccordionItemProps {
  value: string
  children: React.ReactNode
  className?: string
}

function AccordionItem({ value, children, className }: AccordionItemProps) {
  const { value: accordionValue, type } = useAccordion()
  const isOpen = type === "single"
    ? accordionValue === value
    : Array.isArray(accordionValue) && accordionValue.includes(value)

  return (
    <div className={cn("border-b", className)} data-state={isOpen ? "open" : "closed"}>
      {children}
    </div>
  )
}

interface AccordionTriggerProps {
  children: React.ReactNode
  className?: string
}

function AccordionTrigger({ children, className }: AccordionTriggerProps) {
  const { value: accordionValue, onValueChange, type, collapsible } = useAccordion()
  const item = React.useContext(AccordionItemContext)
  if (!item) {
    throw new Error("AccordionTrigger must be used within an AccordionItem")
  }

  const isOpen = type === "single"
    ? accordionValue === item.value
    : Array.isArray(accordionValue) && accordionValue.includes(item.value)

  const handleClick = () => {
    if (type === "single") {
      onValueChange(isOpen && collapsible ? "" : item.value)
    } else {
      const currentValue = Array.isArray(accordionValue) ? accordionValue : []
      if (isOpen) {
        onValueChange(currentValue.filter((v) => v !== item.value))
      } else {
        onValueChange([...currentValue, item.value])
      }
    }
  }

  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center justify-between py-4 text-left font-medium transition-all hover:underline",
        "[&[data-state=open]>svg]:rotate-180",
        className
      )}
      onClick={handleClick}
      data-state={isOpen ? "open" : "closed"}
    >
      {children}
      <svg
        className="h-4 w-4 shrink-0 transition-transform duration-200"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  )
}

interface AccordionContentProps {
  children: React.ReactNode
  className?: string
}

const AccordionItemContext = React.createContext<{ value: string } | null>(null)

function AccordionContent({ children, className }: AccordionContentProps) {
  const { value: accordionValue, type } = useAccordion()
  const item = React.useContext(AccordionItemContext)
  if (!item) {
    throw new Error("AccordionContent must be used within an AccordionItem")
  }

  const isOpen = type === "single"
    ? accordionValue === item.value
    : Array.isArray(accordionValue) && accordionValue.includes(item.value)

  if (!isOpen) return null

  return (
    <div
      className={cn(
        "overflow-hidden text-sm transition-all",
        "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
        className
      )}
      data-state={isOpen ? "open" : "closed"}
    >
      <div className="pb-4 pt-0">{children}</div>
    </div>
  )
}

// Wrapper für AccordionItem, um Context zu setzen
function AccordionItemWithContext({ value, children, className }: AccordionItemProps) {
  return (
    <AccordionItemContext.Provider value={{ value }}>
      <AccordionItem value={value} className={className}>
        {children}
      </AccordionItem>
    </AccordionItemContext.Provider>
  )
}

export {
  Accordion,
  AccordionItem: AccordionItemWithContext,
  AccordionTrigger,
  AccordionContent,
}

