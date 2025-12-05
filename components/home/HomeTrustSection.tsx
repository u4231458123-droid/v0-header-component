"use client"

import { V28MarketingSection } from "@/components/design-system/V28MarketingSection"

const ShieldIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
  </svg>
)

const LockIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const CheckCircle2Icon = ({ className }: { className?: string }) => (
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
    <path d="m9 12 2 2 4-4" />
  </svg>
)

const AwardIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" />
    <circle cx="12" cy="8" r="6" />
  </svg>
)

export const HomeTrustSection = () => {
  return (
    <V28MarketingSection background="slate" className="py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-card/10 rounded-xl flex items-center justify-center mb-3">
            <ShieldIcon className="w-6 h-6 md:w-7 md:h-7 text-primary-foreground" />
          </div>
          <h3 className="text-sm md:text-base font-semibold text-primary-foreground mb-1">ISO 27001</h3>
          <p className="text-xs md:text-sm text-slate-300">Zertifiziert</p>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-card/10 rounded-xl flex items-center justify-center mb-3">
            <LockIcon className="w-6 h-6 md:w-7 md:h-7 text-primary-foreground" />
          </div>
          <h3 className="text-sm md:text-base font-semibold text-primary-foreground mb-1">DSGVO</h3>
          <p className="text-xs md:text-sm text-slate-300">100% Konform</p>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-card/10 rounded-xl flex items-center justify-center mb-3">
            <CheckCircle2Icon className="w-6 h-6 md:w-7 md:h-7 text-primary-foreground" />
          </div>
          <h3 className="text-sm md:text-base font-semibold text-primary-foreground mb-1">GoBD</h3>
          <p className="text-xs md:text-sm text-slate-300">Zertifiziert</p>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-card/10 rounded-xl flex items-center justify-center mb-3">
            <AwardIcon className="w-6 h-6 md:w-7 md:h-7 text-primary-foreground" />
          </div>
          <h3 className="text-sm md:text-base font-semibold text-primary-foreground mb-1">Made in DE</h3>
          <p className="text-xs md:text-sm text-slate-300">Server in Deutschland</p>
        </div>
      </div>
    </V28MarketingSection>
  )
}
