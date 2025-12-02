/**
 * ARBEITS-DOKUMENTATION
 * =====================
 * Dokumentiert jede Arbeit mit Zeitstempel, Datum, Name
 */

import { promises as fs } from "fs"
import path from "path"

export interface WorkDocumentation {
  id: string
  timestamp: string // ISO-Datum
  germanTime: string // Deutsche Zeit (MEZ/MESZ)
  germanDate: string // Deutsches Datum (DD.MM.YYYY)
  botName: string // Name des Bots/Assistenten
  area: string // Bereich
  task: string // Aufgabe
  result: string // Ergebnis
  reflection: {
    before: string // Reflexion vor Aufgabe
    during: string // Reflexion während Aufgabe
    after: string // Reflexion nach Aufgabe
    issues: string[] // Gefundene Probleme
    technicalLimitations: string[] // Technische Einschränkungen
  }
  errors?: Array<{
    type: string
    severity: "critical" | "high" | "medium" | "low"
    message: string
    solution?: string
  }>
  validation?: {
    validatedBy: string
    validatedAt: string
    passed: boolean
    issues: string[]
  }
  signedBy?: string // Bot der abgenommen hat
  signedAt?: string // Zeitpunkt der Abnahme
}

/**
 * Konvertiere ISO-Datum zu deutscher Zeit
 */
function toGermanTime(isoDate: string): { time: string; date: string } {
  const date = new Date(isoDate)
  
  // Konvertiere zu deutscher Zeit (MEZ/MESZ)
  const germanDate = new Date(date.toLocaleString("en-US", { timeZone: "Europe/Berlin" }))
  
  // Format: HH:MM:SS
  const hours = germanDate.getHours().toString().padStart(2, "0")
  const minutes = germanDate.getMinutes().toString().padStart(2, "0")
  const seconds = germanDate.getSeconds().toString().padStart(2, "0")
  const time = `${hours}:${minutes}:${seconds}`
  
  // Format: DD.MM.YYYY
  const day = germanDate.getDate().toString().padStart(2, "0")
  const month = (germanDate.getMonth() + 1).toString().padStart(2, "0")
  const year = germanDate.getFullYear()
  const dateStr = `${day}.${month}.${year}`
  
  return { time, date: dateStr }
}

const DOCUMENTATION_DIR = path.join(process.cwd(), ".cicd", "work-documentation")
const DOCUMENTATION_FILE = path.join(DOCUMENTATION_DIR, "work-docs.json")

/**
 * Dokumentiere Arbeit
 */
export async function documentWork(
  botName: string,
  area: string,
  task: string,
  result: string,
  reflection: WorkDocumentation["reflection"],
  errors?: WorkDocumentation["errors"]
): Promise<WorkDocumentation> {
  const timestamp = new Date().toISOString()
  const { time: germanTime, date: germanDate } = toGermanTime(timestamp)
  
  const documentation: WorkDocumentation = {
    id: `work-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    timestamp,
    germanTime,
    germanDate,
    botName,
    area,
    task,
    result,
    reflection,
    errors,
  }
  
  // Speichere Dokumentation
  await saveDocumentation(documentation)
  
  console.log(`📝 Arbeit dokumentiert: ${botName} - ${task} (${germanDate} ${germanTime})`)
  
  return documentation
}

/**
 * Validiere Arbeit
 */
export async function validateWork(
  workId: string,
  validatedBy: string,
  passed: boolean,
  issues: string[] = []
): Promise<void> {
  const documentation = await loadDocumentation(workId)
  if (!documentation) {
    throw new Error(`Dokumentation ${workId} nicht gefunden`)
  }
  
  documentation.validation = {
    validatedBy,
    validatedAt: new Date().toISOString(),
    passed,
    issues,
  }
  
  await saveDocumentation(documentation)
}

/**
 * Zeichne Arbeit (Abnahme)
 */
export async function signWork(
  workId: string,
  signedBy: string
): Promise<void> {
  const documentation = await loadDocumentation(workId)
  if (!documentation) {
    throw new Error(`Dokumentation ${workId} nicht gefunden`)
  }
  
  if (!documentation.validation || !documentation.validation.passed) {
    throw new Error(`Arbeit ${workId} wurde nicht validiert oder nicht bestanden`)
  }
  
  documentation.signedBy = signedBy
  documentation.signedAt = new Date().toISOString()
  
  await saveDocumentation(documentation)
  
  console.log(`✅ Arbeit abgenommen: ${workId} von ${signedBy}`)
}

/**
 * Lade Dokumentation
 */
async function loadDocumentation(workId: string): Promise<WorkDocumentation | null> {
  const allDocs = await loadAllDocumentations()
  return allDocs.find((doc) => doc.id === workId) || null
}

/**
 * Lade alle Dokumentationen
 */
async function loadAllDocumentations(): Promise<WorkDocumentation[]> {
  try {
    await fs.mkdir(DOCUMENTATION_DIR, { recursive: true })
    const content = await fs.readFile(DOCUMENTATION_FILE, "utf-8")
    return JSON.parse(content)
  } catch (error: any) {
    if (error.code === "ENOENT") return []
    console.error("Fehler beim Laden der Dokumentationen:", error)
    return []
  }
}

/**
 * Speichere Dokumentation
 */
async function saveDocumentation(doc: WorkDocumentation): Promise<void> {
  const allDocs = await loadAllDocumentations()
  const index = allDocs.findIndex((d) => d.id === doc.id)
  if (index > -1) {
    allDocs[index] = doc
  } else {
    allDocs.push(doc)
  }
  await fs.writeFile(DOCUMENTATION_FILE, JSON.stringify(allDocs, null, 2), "utf-8")
}

/**
 * Finde Fehler nach Bot
 */
export async function findErrorsByBot(botName: string): Promise<WorkDocumentation[]> {
  const allDocs = await loadAllDocumentations()
  return allDocs.filter((doc) => 
    doc.botName === botName && 
    doc.errors && 
    doc.errors.length > 0
  )
}

/**
 * Finde alle Arbeiten eines Bots
 */
export async function findWorksByBot(botName: string): Promise<WorkDocumentation[]> {
  const allDocs = await loadAllDocumentations()
  return allDocs.filter((doc) => doc.botName === botName)
}

