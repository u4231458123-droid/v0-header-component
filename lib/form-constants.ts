/**
 * MyDispatch Formular-Konstanten und Validierungen
 * Basierend auf: 1_MyDispatch_Lastenheft.pdf, 2_MyDispatch_Eingabe-Felder.pdf, 3_MyDispatch_Info-EingabeFelder.pdf
 */

// =============================================================================
// ANREDE / TITEL
// =============================================================================
export const SALUTATION_OPTIONS = [
  { value: "Herr", label: "Herr" },
  { value: "Frau", label: "Frau" },
  { value: "Divers", label: "Divers" },
] as const

export const TITLE_OPTIONS = [
  { value: "", label: "Kein Titel" },
  { value: "Dr.", label: "Dr." },
  { value: "Prof.", label: "Prof." },
  { value: "Prof. Dr.", label: "Prof. Dr." },
] as const

// =============================================================================
// FAHRZEUG KATEGORIEN (aus PDF: Economy / Kombi / Business / First Class / Van)
// =============================================================================
export const VEHICLE_CATEGORIES = [
  { value: "economy", label: "Economy" },
  { value: "kombi", label: "Kombi" },
  { value: "business", label: "Business" },
  { value: "first_class", label: "First Class" },
  { value: "van", label: "Van" },
] as const

// =============================================================================
// PASSAGIER ANZAHL (Dropdown Max. 8)
// =============================================================================
export const PASSENGER_COUNT_OPTIONS = [
  { value: 1, label: "1 Passagier" },
  { value: 2, label: "2 Passagiere" },
  { value: 3, label: "3 Passagiere" },
  { value: 4, label: "4 Passagiere" },
  { value: 5, label: "5 Passagiere" },
  { value: 6, label: "6 Passagiere" },
  { value: 7, label: "7 Passagiere" },
  { value: 8, label: "8 Passagiere" },
] as const

// =============================================================================
// KFZ VERSICHERUNG SF-KLASSEN (nach ADAC)
// =============================================================================
export const SF_CLASSES = [
  { value: "SF0", label: "SF 0" },
  { value: "SF1/2", label: "SF 1/2" },
  { value: "SF1", label: "SF 1" },
  { value: "SF2", label: "SF 2" },
  { value: "SF3", label: "SF 3" },
  { value: "SF4", label: "SF 4" },
  { value: "SF5", label: "SF 5" },
  { value: "SF6", label: "SF 6" },
  { value: "SF7", label: "SF 7" },
  { value: "SF8", label: "SF 8" },
  { value: "SF9", label: "SF 9" },
  { value: "SF10", label: "SF 10" },
  { value: "SF11", label: "SF 11" },
  { value: "SF12", label: "SF 12" },
  { value: "SF13", label: "SF 13" },
  { value: "SF14", label: "SF 14" },
  { value: "SF15", label: "SF 15" },
  { value: "SF16", label: "SF 16" },
  { value: "SF17", label: "SF 17" },
  { value: "SF18", label: "SF 18" },
  { value: "SF19", label: "SF 19" },
  { value: "SF20", label: "SF 20" },
  { value: "SF21", label: "SF 21" },
  { value: "SF22", label: "SF 22" },
  { value: "SF23", label: "SF 23" },
  { value: "SF24", label: "SF 24" },
  { value: "SF25", label: "SF 25" },
  { value: "SF26", label: "SF 26" },
  { value: "SF27", label: "SF 27" },
  { value: "SF28", label: "SF 28" },
  { value: "SF29", label: "SF 29" },
  { value: "SF30", label: "SF 30" },
  { value: "SF31", label: "SF 31" },
  { value: "SF32", label: "SF 32" },
  { value: "SF33", label: "SF 33" },
  { value: "SF34", label: "SF 34" },
  { value: "SF35", label: "SF 35" },
  { value: "S", label: "S (Schadenklasse)" },
  { value: "M", label: "M (Malusklasse)" },
] as const

// =============================================================================
// SELBSTBETEILIGUNG TK/VK (Dropdown: 0€ / 150€ / 300€ / 500€ / 1000€)
// =============================================================================
export const DEDUCTIBLE_OPTIONS = [
  { value: 0, label: "0,- €" },
  { value: 150, label: "150,- €" },
  { value: 300, label: "300,- €" },
  { value: 500, label: "500,- €" },
  { value: 1000, label: "1.000,- €" },
] as const

// =============================================================================
// FUEHRERSCHEIN KLASSEN (Klick/Anwaehlbar)
// =============================================================================
export const LICENSE_CLASSES = [
  { value: "AM", label: "AM" },
  { value: "A1", label: "A1" },
  { value: "A2", label: "A2" },
  { value: "A", label: "A" },
  { value: "B", label: "B" },
  { value: "BE", label: "BE" },
  { value: "B96", label: "B96" },
  { value: "C1", label: "C1" },
  { value: "C1E", label: "C1E" },
  { value: "C", label: "C" },
  { value: "CE", label: "CE" },
  { value: "D1", label: "D1" },
  { value: "D1E", label: "D1E" },
  { value: "D", label: "D" },
  { value: "DE", label: "DE" },
  { value: "L", label: "L" },
  { value: "T", label: "T" },
] as const

// =============================================================================
// ZAHLUNGSARTEN
// =============================================================================
export const PAYMENT_METHODS = [
  { value: "cash", label: "Bar" },
  { value: "invoice", label: "Rechnung" },
  { value: "card", label: "Kreditkarte" },
] as const

// =============================================================================
// VALIDIERUNGSREGELN (aus PDF 3_MyDispatch_Info-EingabeFelder.pdf)
// =============================================================================
export const VALIDATION_RULES = {
  // PLZ: 5-stellig, nur Zahlen
  postalCode: {
    pattern: /^\d{5}$/,
    maxLength: 5,
    message: "PLZ muss 5-stellig sein (nur Zahlen)",
  },

  // Telefon/Mobil: nur Zahlen, max 20 Zeichen
  phone: {
    pattern: /^[\d\s+\-/$$$$]+$/,
    maxLength: 20,
    message: "Telefonnummer ungueltig (max. 20 Zeichen)",
  },

  // KFZ-Kennzeichen: Deutsche Standard-Vorgabe (DEG-XX 123 E)
  licensePlate: {
    pattern: /^[A-ZÄÖÜ]{1,3}[-\s]?[A-Z]{1,2}[-\s]?\d{1,4}[-\s]?[A-Z]?$/i,
    maxLength: 15,
    message: "Kennzeichen im Format: DEG-XX 123 oder DEG-XX 123 E",
  },

  // FIN (Fahrzeug-Identifikationsnummer): max. 17 Zeichen
  vin: {
    pattern: /^[A-HJ-NPR-Z0-9]{17}$/i,
    maxLength: 17,
    message: "FIN muss 17 Zeichen lang sein",
  },

  // HSN (Herstellerschluesselnummer): max. 4 Zeichen
  hsn: {
    pattern: /^\d{4}$/,
    maxLength: 4,
    message: "HSN muss 4-stellig sein",
  },

  // TSN (Typschluesselnummer): max. 3 Zeichen
  tsn: {
    pattern: /^[A-Z0-9]{3}$/i,
    maxLength: 3,
    message: "TSN muss 3-stellig sein",
  },

  // KW/PS: max. 3 Zeichen
  power: {
    pattern: /^\d{1,3}$/,
    maxLength: 3,
    message: "Leistung: max. 3 Ziffern",
  },

  // USt-IdNr.: max. 9 Zeichen (DE + 9 Ziffern)
  vatId: {
    pattern: /^DE\d{9}$/,
    maxLength: 11,
    message: "USt-IdNr. im Format: DE123456789",
  },

  // Steuernummer: max. 13 Zeichen
  taxNumber: {
    pattern: /^[\d/]{10,13}$/,
    maxLength: 13,
    message: "Steuernummer: 10-13 Zeichen",
  },

  // Konzessionsnummer: max. 5 Zeichen
  concessionNumber: {
    pattern: /^[A-Z0-9]{1,5}$/i,
    maxLength: 5,
    message: "Konzessionsnummer: max. 5 Zeichen",
  },

  // P-Schein Nummer: max. 10 Zeichen
  pScheinNumber: {
    pattern: /^[A-Z0-9]{1,10}$/i,
    maxLength: 10,
    message: "P-Schein Nummer: max. 10 Zeichen",
  },

  // Fuehrerscheinnummer: max. 15 Zeichen
  licenseNumber: {
    pattern: /^[A-Z0-9]{1,15}$/i,
    maxLength: 15,
    message: "Fuehrerscheinnummer: max. 15 Zeichen",
  },

  // IBAN Deutschland
  iban: {
    pattern: /^DE\d{2}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{2}$/,
    maxLength: 27,
    message: "IBAN im Format: DE89 3704 0044 0532 0130 00",
  },

  // BIC
  bic: {
    pattern: /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/,
    maxLength: 11,
    message: "BIC: 8 oder 11 Zeichen",
  },
} as const

// =============================================================================
// VALIDIERUNGS-HILFSFUNKTIONEN
// =============================================================================
export function validateField(
  fieldName: keyof typeof VALIDATION_RULES,
  value: string,
): { valid: boolean; message?: string } {
  const rule = VALIDATION_RULES[fieldName]
  if (!rule) return { valid: true }

  if (!value) return { valid: true } // Leere Werte werden separat geprueft (required)

  if (value.length > rule.maxLength) {
    return { valid: false, message: rule.message }
  }

  if (!rule.pattern.test(value)) {
    return { valid: false, message: rule.message }
  }

  return { valid: true }
}

export function formatPhoneNumber(value: string): string {
  // Entfernt alles ausser Zahlen und +
  return value.replace(/[^\d+\s\-/$$$$]/g, "").slice(0, 20)
}

export function formatPostalCode(value: string): string {
  // Nur Zahlen, max 5
  return value.replace(/\D/g, "").slice(0, 5)
}

export function formatLicensePlate(value: string): string {
  // Grossbuchstaben, mit Bindestrich formatieren
  return value.toUpperCase().slice(0, 15)
}

export function formatVIN(value: string): string {
  // Grossbuchstaben, keine I, O, Q (ungueltig bei VIN)
  return value.toUpperCase().replace(/[IOQ]/g, "").slice(0, 17)
}

// =============================================================================
// TYPEN
// =============================================================================
export type SalutationValue = (typeof SALUTATION_OPTIONS)[number]["value"]
export type TitleValue = (typeof TITLE_OPTIONS)[number]["value"]
export type VehicleCategoryValue = (typeof VEHICLE_CATEGORIES)[number]["value"]
export type SFClassValue = (typeof SF_CLASSES)[number]["value"]
export type LicenseClassValue = (typeof LICENSE_CLASSES)[number]["value"]
export type PaymentMethodValue = (typeof PAYMENT_METHODS)[number]["value"]
