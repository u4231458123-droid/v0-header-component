import { redirect } from "next/navigation"

// Redirect old /rechnungen route to new /finanzen route
export default function RechnungenRedirectPage() {
  redirect("/finanzen")
}
