import { FileQuestion, Home, ArrowLeft, Search } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* 404 Illustration */}
        <div className="relative">
          <div className="text-[150px] font-bold text-muted/20 select-none leading-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <FileQuestion className="w-10 h-10 text-primary" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-foreground">
            Seite nicht gefunden
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Die gesuchte Seite existiert nicht oder wurde verschoben.
            Überprüfen Sie die URL oder navigieren Sie zurück.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-medium"
          >
            <Home className="w-4 h-4" />
            Zur Startseite
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border rounded-xl hover:bg-muted transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Zum Dashboard
          </Link>
        </div>

        {/* Quick Links */}
        <div className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">Hilfreiche Links:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/fragen" className="text-primary hover:underline">
              FAQ
            </Link>
            <Link href="/kontakt" className="text-primary hover:underline">
              Kontakt
            </Link>
            <Link href="/preise" className="text-primary hover:underline">
              Preise
            </Link>
            <Link href="/datenschutz" className="text-primary hover:underline">
              Datenschutz
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
