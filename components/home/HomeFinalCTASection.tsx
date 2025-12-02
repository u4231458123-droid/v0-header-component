"use client"

import { useRouter } from "next/navigation"
import { V28Button } from "@/components/design-system/V28Button"

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
)

const SparklesIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    <path d="M20 3v4" />
    <path d="M22 5h-4" />
    <path d="M4 17v2" />
    <path d="M5 18H3" />
  </svg>
)

export const HomeFinalCTASection = () => {
  const router = useRouter()

  return (
    <section className="py-20 bg-primary relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary-foreground rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-foreground rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm mb-6">
            <SparklesIcon className="h-4 w-4 text-primary-foreground" />
            <span className="font-sans text-sm font-medium text-primary-foreground">
              Professionelle Flottenmanagement-Software
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            Bereit, Ihre Disposition zu revolutionieren?
          </h2>

          <p className="font-sans text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto leading-relaxed">
            Starten Sie noch heute und erleben Sie, wie einfach professionelle Flottenverwaltung sein kann.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <V28Button
              onClick={() => router.push("/auth/sign-up")}
              variant="primary"
              size="lg"
              className="w-full sm:w-auto bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              Jetzt starten
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </V28Button>
            <V28Button
              onClick={() => router.push("/pricing")}
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/20"
            >
              Preise ansehen
            </V28Button>
          </div>

          <p className="mt-8 font-sans text-sm text-primary-foreground/70">
            Monatlich kuendbar - Keine versteckten Kosten - Made in Germany
          </p>
        </div>
      </div>
    </section>
  )
}

export default HomeFinalCTASection
