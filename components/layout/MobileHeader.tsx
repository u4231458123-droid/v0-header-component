"use client"

/* ==================================================================================
   MobileHeader V28.2 - v0-KOMPATIBEL
   ==================================================================================
   ✅ Inline-SVGs statt lucide-react für v0-Kompatibilität
   ✅ V28.1 Slate Design System
   ✅ Einheitliche Logo Component Nutzung
   ================================================================================== */

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import { designTokens } from "@/config/design-tokens"
import { Logo } from "@/components/shared/Logo"

const MenuIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
)

const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
)

const BotIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 8V4H8" />
    <rect width="16" height="12" x="4" y="8" rx="2" />
    <path d="M2 14h2" />
    <path d="M20 14h2" />
    <path d="M15 13v2" />
    <path d="M9 13v2" />
  </svg>
)

const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const LogOutIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
)

export function MobileHeader() {
  const { profile, logout } = useAuth()
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 backdrop-blur-md"
        style={{
          zIndex: designTokens.zIndex.mobileHeader,
          height: "56px",
          background: `linear-gradient(135deg, ${designTokens.colors.slate[900]} 0%, ${designTokens.colors.slate[600]} 100%)`,
          borderBottom: `1px solid ${designTokens.colors.slate[200]}`,
        }}
      >
        <div className="flex items-center justify-between h-full px-4">
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => router.push("/dashboard")}
          >
            <Logo className="h-7 w-auto" />
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                const event = new CustomEvent("open-global-search")
                window.dispatchEvent(event)
              }}
              className="h-10 w-10 p-0 text-white hover:bg-white/10 rounded-md transition-colors"
              aria-label="Suche"
            >
              <SearchIcon className="h-5 w-5 mx-auto" />
            </button>

            <button
              onClick={() => {
                const event = new CustomEvent("open-ai-chat")
                window.dispatchEvent(event)
              }}
              className="h-10 w-10 p-0 text-white hover:bg-white/10 rounded-md transition-colors"
              aria-label="AI-Support"
            >
              <BotIcon className="h-5 w-5 mx-auto" />
            </button>

            <button
              onClick={() => setShowMenu(true)}
              className="h-10 w-10 p-0 text-white hover:bg-white/10 rounded-md transition-colors"
              aria-label="Menü öffnen"
            >
              <MenuIcon className="h-5 w-5 mx-auto" />
            </button>
          </div>
        </div>
      </header>

      <Sheet open={showMenu} onOpenChange={setShowMenu}>
        <SheetContent side="right" className="w-80 sm:w-96">
          <SheetHeader>
            <SheetTitle>Menü</SheetTitle>
          </SheetHeader>

          <div className="mt-6 flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback
                  style={{
                    backgroundColor: designTokens.colors.slate[900],
                    color: designTokens.colors.white,
                  }}
                >
                  <UserIcon className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate" style={{ color: designTokens.colors.slate[900] }}>
                  {profile?.full_name || profile?.email || "Benutzer"}
                </div>
                <div className="text-sm truncate" style={{ color: designTokens.colors.slate[600] }}>
                  {profile?.email}
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  router.push("/einstellungen")
                  setShowMenu(false)
                }}
                className="flex items-center gap-3 w-full px-4 py-2 text-left hover:bg-slate-100 rounded-md transition-colors"
              >
                <SettingsIcon className="h-5 w-5" />
                <span>Einstellungen</span>
              </button>

              <button
                onClick={() => {
                  router.push("/einstellungen?tab=account")
                  setShowMenu(false)
                }}
                className="flex items-center gap-3 w-full px-4 py-2 text-left hover:bg-slate-100 rounded-md transition-colors"
              >
                <UserIcon className="h-5 w-5" />
                <span>Profil</span>
              </button>

              <Separator />

              <button
                onClick={logout}
                className="flex items-center gap-3 w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <LogOutIcon className="h-5 w-5" />
                <span>Abmelden</span>
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
