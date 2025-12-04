"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { logger } from "@/lib/logger"
import { AlertTriangleIcon, RefreshIcon, HomeIcon } from "@/components/icons"

interface Props {
  children: React.ReactNode
  pageName: string
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class PageErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error(`Page Error: ${this.props.pageName}`, error, {
      component: this.props.pageName,
      componentStack: errorInfo.componentStack,
      severity: "high",
    })

    this.setState({ errorInfo })
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.reload()
  }

  handleHome = () => {
    window.location.href = "/"
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/50">
          <Card className="w-full max-w-lg border-destructive/30">
            <CardContent className="pt-6 text-center space-y-6">
              <div className="flex justify-center">
                <div className="rounded-full bg-destructive/10 p-4">
                  <AlertTriangleIcon />
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">Fehler beim Laden der Seite</h1>
                <p className="text-muted-foreground">
                  Beim Laden von <strong>{this.props.pageName}</strong> ist ein Fehler aufgetreten.
                </p>
              </div>

              {this.state.error && (
                <div className="text-left bg-muted p-4 rounded-xl">
                  <p className="text-sm font-mono text-foreground">{this.state.error.message}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={this.handleReload} className="flex-1" size="lg">
                  <RefreshIcon />
                  Seite neu laden
                </Button>
                <Button onClick={this.handleHome} variant="secondary" className="flex-1" size="lg">
                  <HomeIcon />
                  Zur Startseite
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Wenn das Problem weiterhin besteht, kontaktieren Sie bitte den Support.
              </p>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
