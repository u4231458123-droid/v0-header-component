"use client"

import type React from "react"
import { useState } from "react"
import { PreLoginHeader } from "@/components/layout/PreLoginHeader"
import { PreLoginFooter } from "@/components/layout/PreLoginFooter"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Clock, CheckCircle, MessageSquare, Users, Headphones, Globe, Send } from "lucide-react"

export default function KontaktPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    subject: "",
    message: "",
    type: "general",
  })
  const [formStatus, setFormStatus] = useState<"idle" | "sending" | "success" | "error">("idle")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = "Bitte geben Sie Ihren Namen ein"
    if (!formData.email.trim()) {
      newErrors.email = "Bitte geben Sie Ihre E-Mail-Adresse ein"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Bitte geben Sie eine gültige E-Mail-Adresse ein"
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Bitte geben Sie Ihre Telefonnummer ein"
    }
    if (!formData.subject.trim()) newErrors.subject = "Bitte geben Sie einen Betreff ein"
    if (!formData.message.trim()) {
      newErrors.message = "Bitte geben Sie eine Nachricht ein"
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Die Nachricht muss mindestens 10 Zeichen lang sein"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setFormStatus("sending")

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormStatus("success")
        setFormData({ name: "", email: "", company: "", phone: "", subject: "", message: "", type: "general" })
        setErrors({})
      } else {
        setFormStatus("error")
      }
    } catch {
      setFormStatus("error")
    }
  }

  const contactInfo = [
    {
      icon: Mail,
      title: "E-Mail",
      lines: ["info@my-dispatch.de", "support@my-dispatch.de"],
      action: { label: "E-Mail senden", href: "mailto:info@my-dispatch.de" },
    },
    {
      icon: Phone,
      title: "Telefon",
      lines: ["+49 (0) 170 8004423", "Mo-Fr, 9:00 - 17:00 Uhr"],
      action: { label: "Anrufen", href: "tel:+4917080044230" },
    },
    {
      icon: MapPin,
      title: "Adresse",
      lines: ["RideHub Solutions", "Ensbachmühle 4", "94571 Schaufling"],
      action: null,
    },
    {
      icon: Clock,
      title: "Geschäftszeiten",
      lines: ["Montag - Freitag: 9:00 - 17:00", "Samstag & Sonntag: Geschlossen"],
      action: null,
    },
  ]

  const contactOptions = [
    {
      icon: MessageSquare,
      title: "Allgemeine Anfragen",
      description: "Fragen zu MyDispatch, Funktionen und Partnerschaften",
      email: "info@my-dispatch.de",
    },
    {
      icon: Headphones,
      title: "Technischer Support",
      description: "Hilfe bei technischen Problemen und Fehlern",
      email: "support@my-dispatch.de",
    },
    {
      icon: Users,
      title: "Vertrieb & Demo",
      description: "Produktvorstellung und individuelle Beratung",
      email: "sales@my-dispatch.de",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <PreLoginHeader activePage="kontakt" />

      <main className="pt-24 pb-16">
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
              Kontaktieren Sie uns
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Wir sind für Sie da. Nehmen Sie Kontakt mit unserem Team auf – wir antworten in der Regel innerhalb von 24
              Stunden.
            </p>
          </div>

          <div className="max-w-5xl mx-auto mb-12">
            <div className="grid md:grid-cols-3 gap-6">
              {contactOptions.map((option) => (
                <Card
                  key={option.title}
                  className="rounded-2xl border-border hover:border-primary/50 transition-colors text-center p-6"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <option.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{option.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{option.description}</p>
                  <a href={`mailto:${option.email}`} className="text-primary hover:underline text-sm font-medium">
                    {option.email}
                  </a>
                </Card>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Contact Form - 2 Spalten */}
            <Card className="lg:col-span-2 rounded-2xl border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-primary" />
                  Nachricht senden
                </CardTitle>
                <CardDescription>
                  Füllen Sie das Formular aus und wir melden uns schnellstmöglich bei Ihnen.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {formStatus === "success" ? (
                  <div className="bg-primary/10 border border-primary/30 rounded-xl p-8 text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Nachricht gesendet!</h3>
                    <p className="text-muted-foreground mb-6">
                      Vielen Dank für Ihre Nachricht. Wir melden uns schnellstmöglich bei Ihnen.
                    </p>
                    <Button variant="outline" onClick={() => setFormStatus("idle")} className="rounded-xl">
                      Weitere Nachricht senden
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label>Art der Anfrage</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: "general", label: "Allgemein" },
                          { value: "support", label: "Support" },
                          { value: "sales", label: "Vertrieb" },
                        ].map((type) => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, type: type.value })}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                              formData.type === type.value
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                          >
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className={`rounded-xl ${errors.name ? "border-red-500" : ""}`}
                          placeholder="Ihr vollständiger Name"
                        />
                        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">E-Mail *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className={`rounded-xl ${errors.email ? "border-red-500" : ""}`}
                          placeholder="ihre@email.de"
                        />
                        {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company">Unternehmen</Label>
                        <Input
                          id="company"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          className="rounded-xl"
                          placeholder="Ihr Unternehmen (optional)"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefon *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className={`rounded-xl ${errors.phone ? "border-red-500" : ""}`}
                          placeholder="+49 123 456789"
                          required
                        />
                        {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Betreff *</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className={`rounded-xl ${errors.subject ? "border-red-500" : ""}`}
                        placeholder="Wie können wir helfen?"
                      />
                      {errors.subject && <p className="text-sm text-red-600">{errors.subject}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Nachricht *</Label>
                      <Textarea
                        id="message"
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className={`rounded-xl ${errors.message ? "border-red-500" : ""}`}
                        placeholder="Ihre Nachricht... (mindestens 10 Zeichen)"
                      />
                      {errors.message && <p className="text-sm text-red-600">{errors.message}</p>}
                    </div>

                    {formStatus === "error" && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                        <p className="text-sm text-red-800 dark:text-red-200">
                          Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.
                        </p>
                      </div>
                    )}

                    <Button type="submit" className="w-full rounded-xl h-12" disabled={formStatus === "sending"}>
                      {formStatus === "sending" ? "Wird gesendet..." : "Nachricht senden"}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      <span className="text-red-500">*</span> Pflichtfelder. Mit dem Absenden stimmen Sie unserer{" "}
                      <a href="/datenschutz" className="underline hover:text-foreground">
                        Datenschutzerklärung
                      </a>{" "}
                      zu.
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Contact Info - 1 Spalte */}
            <div className="space-y-4">
              {contactInfo.map((info) => (
                <Card key={info.title} className="rounded-2xl border-border hover:border-primary/50 transition-colors">
                  <CardContent className="flex items-start gap-4 p-5">
                    <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <info.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">{info.title}</h3>
                      {info.lines.map((line, i) => (
                        <p key={i} className="text-muted-foreground text-sm">
                          {line}
                        </p>
                      ))}
                      {info.action && (
                        <a
                          href={info.action.href}
                          className="text-primary text-sm font-medium hover:underline mt-2 inline-block"
                        >
                          {info.action.label} →
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="rounded-2xl border-primary/30 bg-primary/5">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Globe className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Online-Demo</h3>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Erleben Sie MyDispatch live in einer persönlichen Demo.
                  </p>
                  <Button variant="outline" className="w-full rounded-xl bg-transparent" asChild>
                    <a href="mailto:sales@my-dispatch.de?subject=Demo-Anfrage">Demo anfragen</a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <PreLoginFooter />
    </div>
  )
}
