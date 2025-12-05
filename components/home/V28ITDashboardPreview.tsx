/* ==================================================================================
   V28 IT DASHBOARD PREVIEW - IT-SUPPORT THEME
   ==================================================================================
   ✅ Browser-Mockup mit IT-Support Dashboard
   ✅ KPI Cards: Server Uptime, Tickets, Response Time, Monitors
   ✅ Activity List: Ticket-System
   ✅ V28.1 Design System (Slate, Flat, Premium Shadows)
   ================================================================================== */

import { V28BrowserMockup } from "./V28BrowserMockup"

// Inline SVG Icons
function ServerIcon({ className }: { className?: string }) {
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
      <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
      <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
      <line x1="6" x2="6.01" y1="6" y2="6" />
      <line x1="6" x2="6.01" y1="18" y2="18" />
    </svg>
  )
}

function ShieldIcon({ className }: { className?: string }) {
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
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
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

function MonitorIcon({ className }: { className?: string }) {
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
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <line x1="8" x2="16" y1="21" y2="21" />
      <line x1="12" x2="12" y1="17" y2="21" />
    </svg>
  )
}

function HeadphonesIcon({ className }: { className?: string }) {
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
      <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
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

function CheckCircle2Icon({ className }: { className?: string }) {
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
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function AlertCircleIcon({ className }: { className?: string }) {
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
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  )
}

interface V28ITDashboardPreviewProps {
  animationDelay?: string
}

export function V28ITDashboardPreview({ animationDelay = "0.6s" }: V28ITDashboardPreviewProps) {
  return (
    <div className="hidden lg:block animate-fade-in" style={{ animationDelay }}>
      <V28BrowserMockup title="support.nexify.nl/dashboard">
        {/* Dashboard Header */}
        <div className="px-6 py-4 border-b border-border bg-background">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-muted ring-1 ring-border">
                <MonitorIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-sans text-base font-bold text-foreground">NeXify IT-Control</h3>
                <p className="font-sans text-xs text-foreground">Echtzeit-Monitoring</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 border border-success rounded-xl">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="font-sans text-xs font-semibold text-green-700">All Systems Operational</span>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6 bg-card space-y-6">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 gap-5">
            {/* Server Uptime Card */}
            <div className="p-4 rounded-xl bg-card border border-border shadow-lg hover:shadow-xl transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-sans text-xs font-medium text-foreground">Server Uptime</span>
                <div className="p-1.5 rounded-xl bg-background">
                  <ServerIcon className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <div className="font-sans text-2xl font-bold text-foreground">99.97%</div>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUpIcon className="w-3 h-3 text-success" />
                <span className="font-sans text-xs font-semibold text-success">+0.02% Uptime</span>
              </div>
            </div>

            {/* Open Tickets Card */}
            <div className="p-4 rounded-xl bg-card border border-border shadow-lg hover:shadow-xl transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-sans text-xs font-medium text-foreground">Open Tickets</span>
                <div className="p-1.5 rounded-xl bg-background">
                  <HeadphonesIcon className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <div className="font-sans text-2xl font-bold text-foreground">12</div>
              <div className="flex items-center gap-1 mt-1">
                <AlertCircleIcon className="w-3 h-3 text-destructive" />
                <span className="font-sans text-xs font-semibold text-destructive">3 Critical</span>
              </div>
            </div>

            {/* Response Time Card */}
            <div className="p-4 rounded-xl bg-card border border-border shadow-lg hover:shadow-xl transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-sans text-xs font-medium text-foreground">Avg. Response</span>
                <div className="p-1.5 rounded-xl bg-background">
                  <ClockIcon className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <div className="font-sans text-2xl font-bold text-foreground">45 Min</div>
              <div className="flex items-center gap-1 mt-1">
                <CheckCircle2Icon className="w-3 h-3 text-success" />
                <span className="font-sans text-xs font-semibold text-success">Schnelle Response</span>
              </div>
            </div>

            {/* Active Monitors Card */}
            <div className="p-4 rounded-xl bg-card border border-border shadow-lg hover:shadow-xl transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-sans text-xs font-medium text-foreground">Active Monitors</span>
                <div className="p-1.5 rounded-xl bg-background">
                  <ShieldIcon className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <div className="font-sans text-2xl font-bold text-foreground">87</div>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-2 h-2 bg-success rounded-full" />
                <span className="font-sans text-xs font-semibold text-foreground">24/7 Active</span>
              </div>
            </div>
          </div>

          {/* Activity List */}
          <div>
            <h4 className="font-sans text-sm font-semibold mb-3 text-foreground">Recent Activities</h4>
            <div className="space-y-2">
              {/* Activity 1 - Completed */}
              <div className="p-3 rounded-xl bg-card border border-border shadow-md hover:shadow-lg transition-all duration-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-xl bg-success/10 mt-0.5">
                      <ServerIcon className="w-4 h-4 text-success" />
                    </div>
                    <div className="flex-1">
                      <div className="font-sans text-sm font-semibold text-foreground mb-1">
                        Server Migration abgeschlossen
                      </div>
                      <div className="font-sans text-xs text-foreground">Mainframe-03 → Cloud-EU-West</div>
                    </div>
                  </div>
                  <div className="px-2 py-1 rounded-xl bg-green-100 border border-success">
                    <span className="font-sans text-xs font-bold text-green-700">Erledigt</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pl-9 pt-3">
                  <div className="flex items-center gap-1 text-foreground">
                    <ClockIcon className="w-3 h-3" />
                    <span className="font-sans text-xs">11:30 Uhr</span>
                  </div>
                  <span className="font-sans text-xs text-foreground">45 Min</span>
                </div>
              </div>

              {/* Activity 2 - In Progress */}
              <div className="p-3 rounded-xl bg-card border border-border shadow-md hover:shadow-lg transition-all duration-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-xl bg-info/10 mt-0.5">
                      <ShieldIcon className="w-4 h-4 text-info" />
                    </div>
                    <div className="flex-1">
                      <div className="font-sans text-sm font-semibold text-foreground mb-1">
                        Firewall-Update läuft...
                      </div>
                      <div className="font-sans text-xs text-foreground">Security-Patch 2024-10</div>
                    </div>
                  </div>
                  <div className="px-2 py-1 rounded-xl bg-blue-100 border border-info">
                    <span className="font-sans text-xs font-bold text-blue-700">Live</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pl-9 pt-3">
                  <div className="flex items-center gap-1 text-foreground">
                    <ClockIcon className="w-3 h-3" />
                    <span className="font-sans text-xs">12:45 Uhr</span>
                  </div>
                  <span className="font-sans text-xs text-foreground">In Progress</span>
                </div>
              </div>

              {/* Activity 3 - Scheduled */}
              <div className="p-3 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-xl bg-muted mt-0.5">
                      <ClockIcon className="w-4 h-4 text-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="font-sans text-sm font-semibold text-foreground mb-1">Backup-Check geplant</div>
                      <div className="font-sans text-xs text-foreground">All Servers + Databases</div>
                    </div>
                  </div>
                  <div className="px-2 py-1 rounded-xl border border-border">
                    <span className="font-sans text-xs font-semibold text-muted-foreground">14:00 Uhr</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pl-9 pt-3">
                  <div className="flex items-center gap-1 text-foreground">
                    <ClockIcon className="w-3 h-3" />
                    <span className="font-sans text-xs">Geplant</span>
                  </div>
                  <span className="font-sans text-xs text-foreground">Heute</span>
                </div>
              </div>
            </div>
          </div>

          {/* System Status LEDs */}
          <div className="flex items-center justify-between pt-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full" />
              <span className="font-sans text-xs text-foreground">Servers Online</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-info rounded-full" />
              <span className="font-sans text-xs text-foreground">Monitoring Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-warning rounded-full" />
              <span className="font-sans text-xs text-foreground">Updates Pending</span>
            </div>
          </div>
        </div>
      </V28BrowserMockup>
    </div>
  )
}
