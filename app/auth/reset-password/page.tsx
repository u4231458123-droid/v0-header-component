"use client"

import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { updatePasswordAction } from "@/app/actions/auth"

function ResetPasswordForm() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Extract token from URL hash (Supabase sends it as fragment)
    if (typeof window !== "undefined") {
      const hash = window.location.hash
      if (hash) {
        const params = new URLSearchParams(hash.substring(1))
        const token = params.get("access_token")
        if (token) {
          setAccessToken(token)
        }
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError("Das Passwort muss mindestens 8 Zeichen lang sein.")
      return
    }

    if (password !== confirmPassword) {
      setError("Die Passwörter stimmen nicht überein.")
      return
    }

    if (!accessToken) {
      setError("Ungültiger oder abgelaufener Link. Bitte fordern Sie einen neuen an.")
      return
    }

    setIsLoading(true)

    try {
      const result = await updatePasswordAction(accessToken, password)

      if (!result.success) {
        setError(result.error || "Ein Fehler ist aufgetreten.")
        return
      }

      setIsSuccess(true)

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/auth/login")
      }, 3000)
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
          <h1 className="text-4xl font-bold mb-6 leading-tight">Neues Passwort festlegen</h1>
          <p className="text-xl text-primary-foreground/80 mb-8">
            Wählen Sie ein sicheres Passwort mit mindestens 8 Zeichen. Verwenden Sie am besten eine Kombination aus
            Buchstaben, Zahlen und Sonderzeichen.
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
            {isSuccess ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Passwort geändert</h2>
                <p className="text-muted-foreground mb-6">
                  Ihr Passwort wurde erfolgreich geändert. Sie werden zur Anmeldung weitergeleitet...
                </p>
                <Link
                  href="/auth/login"
                  className="inline-block w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 text-center transition-colors"
                >
                  Jetzt anmelden
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Neues Passwort</h2>
                  <p className="text-muted-foreground">Geben Sie Ihr neues Passwort ein.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                      Neues Passwort
                    </label>
                    <input
                      id="password"
                      type="password"
                      placeholder="Mindestens 8 Zeichen"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                      Passwort bestätigen
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      placeholder="Passwort wiederholen"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                    {isLoading ? "Wird gespeichert..." : "Passwort ändern"}
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-muted">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Wird geladen...</p>
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
