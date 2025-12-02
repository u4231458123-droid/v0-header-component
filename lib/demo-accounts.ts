/**
 * Demo-Accounts Konfiguration für MyDispatch
 * Diese Accounts dienen zur Präsentation des Systems
 */

export const DEMO_ACCOUNTS = {
  starter: {
    email: "demo.starter@my-dispatch.de",
    password: "De.25-STR_#mO_!",
    tier: "starter",
    name: "Demo Starter",
    companyName: "Demo Starter GmbH",
    description: "Starter-Tarif Demo mit max. 3 Fahrern und 3 Fahrzeugen",
  },
  business: {
    email: "demo.business@my-dispatch.de",
    password: "De.BsS_25#mO_!",
    tier: "business",
    name: "Demo Business",
    companyName: "Demo Business GmbH",
    description: "Business-Tarif Demo mit unbegrenzten Fahrern und Fahrzeugen",
  },
} as const

export const MASTER_ACCOUNT = {
  email: "info@my-dispatch.de",
  password: "#25_FS.42-FKS!",
  role: "master_admin",
  name: "Master Admin",
  description: "Master-Admin Account für Systemverwaltung",
} as const

// Alternative Master-Account E-Mail (für Entwicklung)
export const DEVELOPER_MASTER_ACCOUNT = {
  email: "courbois1981@gmail.com",
  role: "master_admin",
  name: "Developer Master",
  description: "Entwickler Master-Admin Account",
} as const

/**
 * Prüft ob eine E-Mail ein Demo-Account ist
 */
export function isDemoAccount(email: string): boolean {
  return email === DEMO_ACCOUNTS.starter.email || email === DEMO_ACCOUNTS.business.email
}

/**
 * Prüft ob eine E-Mail ein Master-Account ist
 */
export function isMasterAccount(email: string): boolean {
  return email === MASTER_ACCOUNT.email || email === DEVELOPER_MASTER_ACCOUNT.email
}

/**
 * Holt die Demo-Account-Details basierend auf E-Mail
 */
export function getDemoAccountDetails(email: string) {
  if (email === DEMO_ACCOUNTS.starter.email) {
    return DEMO_ACCOUNTS.starter
  }
  if (email === DEMO_ACCOUNTS.business.email) {
    return DEMO_ACCOUNTS.business
  }
  return null
}
