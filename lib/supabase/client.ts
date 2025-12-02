import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr"

// Dummy-Client für Build-Zeit (nur SSR)
const createDummyClient = () => ({
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    signOut: async () => ({ error: null }),
    signIn: async () => ({ error: null }),
    signUp: async () => ({ error: null }),
  },
  from: () => ({
    select: () => ({ data: null, error: null }),
    insert: () => ({ data: null, error: null }),
    update: () => ({ data: null, error: null }),
    delete: () => ({ data: null, error: null }),
  }),
} as unknown as ReturnType<typeof createSupabaseBrowserClient>)

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // During build time on server, return dummy client
  if (typeof window === "undefined" && (!url || !key)) {
    return createDummyClient()
  }

  if (!url || !key) {
    throw new Error("Supabase environment variables are not set")
  }

  return createSupabaseBrowserClient(url, key)
}

// Safe version that returns null instead of throwing on server
export function createClientSafe() {
  if (typeof window === "undefined") {
    return null
  }
  try {
    return createClient()
  } catch {
    return null
  }
}

// Alias for backwards compatibility
export const createBrowserClient = createClient
