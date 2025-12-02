import { redirect } from "next/navigation"

// Redirect old /fahrer route to new /fleet route
export default function FahrerRedirectPage() {
  redirect("/fleet")
}
