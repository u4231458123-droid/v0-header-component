/* ==================================================================================
   V28 DASHBOARD PREVIEW (DEPRECATED - USE ThematicDashboards INSTEAD)
   ================================================================================== */

function FileTextIcon({ className }: { className?: string }) {
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
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  )
}
function EuroIcon({ className }: { className?: string }) {
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
      <path d="M4 10h12" />
      <path d="M4 14h9" />
      <path d="M19 6a7.7 7.7 0 0 0-5.2-2A7.9 7.9 0 0 0 6 12c0 4.4 3.5 8 7.8 8 2 0 3.8-.8 5.2-2" />
    </svg>
  )
}
function UsersIcon({ className }: { className?: string }) {
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
function CarIcon({ className }: { className?: string }) {
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
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <path d="M9 17h6" />
      <circle cx="17" cy="17" r="2" />
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
function TrendingUpIcon({ className }: { className?: string }) {
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
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  )
}
import { V28BrowserMockup } from "./V28BrowserMockup"

interface V28DashboardPreviewProps {
  animationDelay?: string
  title?: string
}

export function V28DashboardPreview({
  animationDelay = "0.6s",
  title = "my-dispatch.de/dashboard",
}: V28DashboardPreviewProps) {
  return (
    <div className="hidden lg:block animate-fade-in" style={{ animationDelay }}>
      <V28BrowserMockup title={title}>
        {/* Dashboard Header */}
        <div className="px-6 py-4 border-b border-border bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-muted ring-1 ring-border">
                <TrendingUpIcon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-sans text-base font-bold text-foreground">Live-Dashboard</h3>
                <p className="font-sans text-xs text-muted-foreground">Echtzeit-Übersicht</p>
              </div>
            </div>
            <div className="px-2 py-1 rounded-xl bg-green-100 ring-1 ring-green-200">
              <span className="font-sans text-xs font-bold text-green-700">Live</span>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6 bg-card space-y-6">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 gap-5">
            <div className="p-4 rounded-xl bg-card border border-border shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-sans text-xs font-medium text-muted-foreground">Aufträge</span>
                <div className="p-1.5 rounded-xl bg-muted">
                  <FileTextIcon className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <div className="font-sans text-2xl font-bold text-foreground">142</div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUpIcon className="w-3 h-3 text-success" />
                <span className="font-sans text-xs font-semibold text-success">+12%</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-sans text-xs font-medium text-muted-foreground">Umsatz</span>
                <div className="p-1.5 rounded-xl bg-muted">
                  <EuroIcon className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <div className="font-sans text-2xl font-bold text-foreground">12.5k</div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUpIcon className="w-3 h-3 text-success" />
                <span className="font-sans text-xs font-semibold text-success">+8%</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-sans text-xs font-medium text-muted-foreground">Fahrer</span>
                <div className="p-1.5 rounded-xl bg-muted">
                  <UsersIcon className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <div className="font-sans text-2xl font-bold text-foreground">28</div>
              <div className="font-sans text-xs text-muted-foreground mt-1">Aktiv</div>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-sans text-xs font-medium text-muted-foreground">Fahrzeuge</span>
                <div className="p-1.5 rounded-xl bg-muted">
                  <CarIcon className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <div className="font-sans text-2xl font-bold text-foreground">35</div>
              <div className="font-sans text-xs text-muted-foreground mt-1">Im Einsatz</div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-3">
            <h4 className="font-sans text-sm font-semibold text-foreground">Letzte Aktivitäten</h4>
            {[
              { name: "Auftrag #2847", time: "vor 2 Min.", status: "Abgeschlossen" },
              { name: "Auftrag #2846", time: "vor 8 Min.", status: "In Bearbeitung" },
              { name: "Auftrag #2845", time: "vor 15 Min.", status: "Zugewiesen" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-xl border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-xl bg-card border border-border">
                    <ClockIcon className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-sans text-sm font-semibold text-foreground">{item.name}</p>
                    <p className="font-sans text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
                <span className="font-sans text-xs font-medium text-muted-foreground px-2 py-1 bg-card rounded border border-border">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </V28BrowserMockup>
    </div>
  )
}
