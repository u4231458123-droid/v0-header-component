"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

// Deutsche Fuehrerscheinklassen
export const LICENSE_CLASSES = [
  { value: "AM", label: "AM", description: "Mopeds, Roller bis 45 km/h" },
  { value: "A1", label: "A1", description: "Leichtkraftraeder bis 125 ccm" },
  { value: "A2", label: "A2", description: "Kraftraeder bis 35 kW" },
  { value: "A", label: "A", description: "Kraftraeder unbegrenzt" },
  { value: "B", label: "B", description: "PKW bis 3,5t" },
  { value: "BE", label: "BE", description: "PKW mit Anhaenger" },
  { value: "B96", label: "B96", description: "PKW mit schwerem Anhaenger" },
  { value: "C1", label: "C1", description: "LKW bis 7,5t" },
  { value: "C1E", label: "C1E", description: "LKW bis 7,5t mit Anhaenger" },
  { value: "C", label: "C", description: "LKW ueber 7,5t" },
  { value: "CE", label: "CE", description: "LKW mit Anhaenger" },
  { value: "D1", label: "D1", description: "Kleinbusse bis 16 Personen" },
  { value: "D1E", label: "D1E", description: "Kleinbusse mit Anhaenger" },
  { value: "D", label: "D", description: "Busse" },
  { value: "DE", label: "DE", description: "Busse mit Anhaenger" },
  { value: "L", label: "L", description: "Land-/Forstwirtschaft" },
  { value: "T", label: "T", description: "Land-/Forstwirtschaft schnell" },
]

interface LicenseClassSelectorProps {
  selectedClasses: string[]
  onChange: (classes: string[]) => void
  disabled?: boolean
}

export function LicenseClassSelector({ selectedClasses, onChange, disabled = false }: LicenseClassSelectorProps) {
  const toggleClass = (classValue: string) => {
    if (disabled) return

    if (selectedClasses.includes(classValue)) {
      onChange(selectedClasses.filter((c) => c !== classValue))
    } else {
      onChange([...selectedClasses, classValue])
    }
  }

  return (
    <div className="space-y-3">
      <Label>Fuehrerscheinklassen</Label>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {LICENSE_CLASSES.map((cls) => (
          <div
            key={cls.value}
            className={`
              flex items-center justify-center gap-2 p-2 rounded-xl border cursor-pointer transition-colors
              ${
                selectedClasses.includes(cls.value)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-muted border-border"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            `}
            onClick={() => toggleClass(cls.value)}
            title={cls.description}
          >
            <Checkbox checked={selectedClasses.includes(cls.value)} disabled={disabled} className="sr-only" />
            <span className="text-sm font-medium">{cls.label}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Klicken Sie auf die Klassen, um sie auszuwaehlen. Aktuell:{" "}
        {selectedClasses.length > 0 ? selectedClasses.join(", ") : "Keine"}
      </p>
    </div>
  )
}
