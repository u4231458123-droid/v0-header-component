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

/**
 * Prüft ob eine E-Mail ein Demo-Account ist
 */
export function isDemoAccount(email: string): boolean {
  return email === DEMO_ACCOUNTS.starter.email || email === DEMO_ACCOUNTS.business.email
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
