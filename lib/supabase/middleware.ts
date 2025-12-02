import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  let user = null
  try {
    const { data, error } = await supabase.auth.getUser()
    if (error) {
      // If refresh token is invalid, clear the session cookies
      if (error.message?.includes("Refresh Token") || error.message?.includes("refresh_token")) {
        // Clear all Supabase auth cookies
        const cookiesToClear = request.cookies
          .getAll()
          .filter((c) => c.name.includes("sb-") || c.name.includes("supabase"))
        cookiesToClear.forEach((cookie) => {
          supabaseResponse.cookies.set(cookie.name, "", { maxAge: 0 })
        })
      }
    } else {
      user = data.user
    }
  } catch (error) {
    // Silently handle auth errors - user will be treated as unauthenticated
    console.error("[v0] Auth error in middleware:", error)
  }

  // Define public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/auth",
    "/pricing",
    "/preise",
    "/docs",
    "/faq",
    "/fragen",
    "/contact",
    "/kontakt",
    "/impressum",
    "/datenschutz",
    "/agb",
    "/terms",
    "/nutzungsbedingungen",
    "/ki-vorschriften",
    "/nexify-support",
    "/kunden-portal",
    "/fahrer-portal",
    "/admin/setup-master",
    "/api/ai",
    "/c", // Company tenant pages
    "/stadt", // SEO Stadt-Landingpages
  ]

  const pathname = request.nextUrl.pathname
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))

  const isAuthCallback = pathname === "/auth/callback"
  const isAuthSignUpSuccess = pathname === "/auth/sign-up-success"
  const isAuthLogout = pathname === "/auth/logout"

  // Redirect to login if not authenticated and not on a public route
  if (!user && !isPublicRoute && !isAuthCallback && !isAuthSignUpSuccess) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  // Das verhindert die Redirect-Schleife fuer Kunden/Fahrer ohne Profil
  // Stattdessen laesst die Login-Seite selbst den Nutzer entscheiden oder leitet basierend auf Nutzertyp weiter

  return supabaseResponse
}
