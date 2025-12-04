"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SelectContextValue {
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  disabled?: boolean
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

function useSelect() {
  const context = React.useContext(SelectContext)
  if (!context) {
    throw new Error("useSelect must be used within a Select")
  }
  return context
}

interface SelectProps {
  children: React.ReactNode
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  name?: string
  required?: boolean
  disabled?: boolean
}

function Select({
  children,
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  open: controlledOpen,
  onOpenChange,
  name,
  required,
  disabled,
}: SelectProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const [internalOpen, setInternalOpen] = React.useState(false)

  const value = controlledValue ?? internalValue
  const open = controlledOpen ?? internalOpen

  const handleValueChange = (newValue: string) => {
    setInternalValue(newValue)
    onValueChange?.(newValue)
  }

  const handleOpenChange = (newOpen: boolean) => {
    setInternalOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  return (
    <SelectContext.Provider value={{ value, onValueChange: handleValueChange, open, setOpen: handleOpenChange, disabled }}>
      <div className="relative inline-block w-full">
        {name && <input type="hidden" name={name} value={value} required={required} />}
        {children}
      </div>
    </SelectContext.Provider>
  )
}

function SelectGroup({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div role="group" {...props}>
      {children}
    </div>
  )
}

interface SelectValueProps {
  placeholder?: string
}

function SelectValue({ placeholder }: SelectValueProps) {
  const { value } = useSelect()
  return <span className="block truncate">{value || placeholder}</span>
}

function SelectTrigger({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { open, setOpen, disabled: contextDisabled } = useSelect()
  const disabled = contextDisabled || props.disabled

  return (
    <button
      type="button"
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm",
        "ring-offset-background placeholder:text-muted-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      onClick={() => !disabled && setOpen(!open)}
      aria-expanded={open}
      disabled={disabled}
      {...props}
    >
      {children}
      <svg className="h-4 w-4 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  )
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { position?: "popper" | "item-aligned" }) {
  const { open, setOpen } = useSelect()
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open, setOpen])

  if (!open) return null

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 mt-1 max-h-96 w-full min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        "animate-in fade-in-0 zoom-in-95",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function SelectLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)} {...props} />
}

function SelectItem({
  className,
  children,
  value,
  disabled,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value: string; disabled?: boolean }) {
  const { value: selectedValue, onValueChange, setOpen } = useSelect()
  const isSelected = value === selectedValue

  return (
    <div
      className={cn(
        "relative flex w-full select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
        disabled
          ? "cursor-not-allowed opacity-50"
          : "cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        className,
      )}
      onClick={() => {
        if (!disabled) {
          onValueChange(value)
          setOpen(false)
        }
      }}
      role="option"
      aria-selected={isSelected}
      aria-disabled={disabled}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        )}
      </span>
      {children}
    </div>
  )
}

function SelectSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
}

function SelectScrollUpButton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex cursor-default items-center justify-center py-1", className)} {...props}>
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m18 15-6-6-6 6" />
      </svg>
    </div>
  )
}

function SelectScrollDownButton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex cursor-default items-center justify-center py-1", className)} {...props}>
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  )
}

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
