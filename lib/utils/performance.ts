/**
 * PERFORMANCE-UTILITIES
 * =====================
 * Optimierte Performance-Hilfsfunktionen
 */

// Logger mit Performance-Optimierung (nur in Development)
const isDevelopment = process.env.NODE_ENV === "development"

export const perfLogger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args)
    }
  },
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args)
    }
  },
  error: (...args: any[]) => {
    // Errors immer loggen
    console.error(...args)
  },
}

// Debounce-Funktion für häufige Aufrufe
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

// Throttle-Funktion für Rate-Limiting
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Cache für teure Operationen
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 Minuten

export function getCached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const cached = cache.get(key)
  const now = Date.now()

  if (cached && now - cached.timestamp < CACHE_TTL) {
    return Promise.resolve(cached.data)
  }

  return fetcher().then((data) => {
    cache.set(key, { data, timestamp: now })
    return data
  })
}

// Batch-Verarbeitung für mehrere Items
export async function batchProcess<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 5
): Promise<R[]> {
  const results: R[] = []
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch.map(processor))
    results.push(...batchResults)
  }
  
  return results
}

// Performance-Timer
export class PerformanceTimer {
  private startTime: number
  private checkpoints: Map<string, number> = new Map()

  constructor() {
    this.startTime = performance.now()
  }

  checkpoint(name: string): void {
    this.checkpoints.set(name, performance.now())
  }

  getElapsed(checkpointName?: string): number {
    if (checkpointName) {
      const checkpoint = this.checkpoints.get(checkpointName)
      return checkpoint ? checkpoint - this.startTime : 0
    }
    return performance.now() - this.startTime
  }

  getCheckpointDiff(checkpoint1: string, checkpoint2: string): number {
    const cp1 = this.checkpoints.get(checkpoint1)
    const cp2 = this.checkpoints.get(checkpoint2)
    if (!cp1 || !cp2) return 0
    return Math.abs(cp2 - cp1)
  }
}

