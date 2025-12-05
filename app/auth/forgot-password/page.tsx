"use client"

import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { requestPasswordResetAction } from "@/app/actions/auth"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await requestPasswordResetAction(email)
      if (result.success) {
        setIsSubmitted(true)
      }
    } catch (err) {
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary text-primary-foreground p-12 flex-col justify-between">
        <div>
          <Link href="/">
            <Image
              src="/images/my-dispatch-simply-arrive-logo.png"
              alt="MyDispatch"
              width={180}
              height={40}
              className="h-10 w-auto brightness-0 invert"
              priority
            />
          </Link>
        </div>

        <div className="max-w-md">
          <h1 className="text-4xl font-bold mb-6 leading-tight">Passwort vergessen?</h1>
          <p className="text-xl text-primary-foreground/80 mb-8">
            Kein Problem! Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen Ihres
            Passworts.
          </p>
        </div>

        <div className="text-sm text-primary-foreground/40">
          © {new Date().getFullYear()} MyDispatch. Made in Germany.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-muted">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-block">
              <Image
                src="/images/my-dispatch-simply-arrive-logo.png"
                alt="MyDispatch"
                width={180}
                height={40}
                className="h-10 w-auto mx-auto"
              />
            </Link>
          </div>

          <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
            {isSubmitted ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">E-Mail gesendet</h2>
                <p className="text-muted-foreground mb-6">
                  Falls ein Konto mit dieser E-Mail-Adresse existiert, haben wir Ihnen einen Link zum Zurücksetzen Ihres
                  Passworts gesendet.
                </p>
                <p className="text-sm text-muted-foreground mb-6">Bitte überprüfen Sie auch Ihren Spam-Ordner.</p>
                <Link
                  href="/auth/login"
                  className="inline-block w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 text-center transition-colors"
                >
                  Zurück zur Anmeldung
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Passwort zurücksetzen</h2>
                  <p className="text-muted-foreground">
                    Geben Sie Ihre E-Mail-Adresse ein, um einen Link zum Zurücksetzen zu erhalten.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      E-Mail Adresse
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="ihre@email.de"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background"
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? "Wird gesendet..." : "Link anfordern"}
                  </button>
                </form>
              </>
            )}
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            <Link href="/auth/login" className="text-primary font-medium hover:underline">
              ← Zurück zur Anmeldung
            </Link>
          </p>

          <div className="mt-8 flex items-center justify-center gap-5 text-sm text-muted-foreground">
            <Link href="/impressum" className="hover:text-foreground">
              Impressum
            </Link>
            <Link href="/datenschutz" className="hover:text-foreground">
              Datenschutz
            </Link>
            <Link href="/agb" className="hover:text-foreground">
              AGB
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
