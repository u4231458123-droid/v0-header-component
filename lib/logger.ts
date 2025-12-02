/**
 * Centralized Logger for Application
 */

type LogLevel = "debug" | "info" | "warn" | "error"

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  data?: unknown
  stack?: string
}

class Logger {
  private isDev = process.env.NODE_ENV === "development"

  private formatEntry(level: LogLevel, message: string, data?: unknown, error?: Error): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
      stack: error?.stack,
    }
  }

  debug(message: string, data?: unknown) {
    if (this.isDev) {
      console.debug(`[DEBUG] ${message}`, data)
    }
  }

  info(message: string, data?: unknown) {
    console.info(`[INFO] ${message}`, data)
  }

  warn(message: string, data?: unknown) {
    console.warn(`[WARN] ${message}`, data)
  }

  error(message: string, error?: Error, data?: unknown) {
    const entry = this.formatEntry("error", message, data, error)
    console.error(`[ERROR] ${message}`, entry)

    // In production, you would send this to an error tracking service
    // e.g., Sentry.captureException(error)
  }

  // Track user actions for analytics
  track(event: string, properties?: Record<string, unknown>) {
    if (this.isDev) {
      console.log(`[TRACK] ${event}`, properties)
    }
    // In production, send to analytics service
  }
}

export const logger = new Logger()
export default logger
