"use client"

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TenantContactSectionProps {
  company: {
    name: string
    address: string
    phone: string
    email: string
    business_hours?: Record<string, any>
  }
}

export function TenantContactSection({ company }: TenantContactSectionProps) {
  const formatBusinessHours = (hours: Record<string, any>) => {
    if (!hours) return "Mo-So: 24/7"

    return Object.entries(hours).map(([day, time]) => (
      <div key={day} className="flex justify-between">
        <span className="font-medium">{day}:</span>
        <span className="text-muted-foreground">{time}</span>
      </div>
    ))
  }

  return (
    <section className="bg-muted/50 py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold lg:text-4xl">Kontakt & Anfahrt</h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Kontaktinformationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {company.address && (
                <div className="flex gap-3">
                  <MapPinIcon className="h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium">Adresse</p>
                    <p className="text-muted-foreground">{company.address}</p>
                  </div>
                </div>
              )}

              {company.phone && (
                <div className="flex gap-3">
                  <PhoneIcon className="h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium">Telefon</p>
                    <a href={`tel:${company.phone}`} className="text-primary hover:underline">
                      {company.phone}
                    </a>
                  </div>
                </div>
              )}

              {company.email && (
                <div className="flex gap-3">
                  <MailIcon className="h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium">E-Mail</p>
                    <a href={`mailto:${company.email}`} className="text-primary hover:underline">
                      {company.email}
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Öffnungszeiten</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <ClockIcon className="h-5 w-5 shrink-0 text-primary" />
                <div className="flex-1 space-y-2">
                  {company.business_hours ? (
                    formatBusinessHours(company.business_hours)
                  ) : (
                    <p className="text-muted-foreground">24/7 für Sie erreichbar</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
