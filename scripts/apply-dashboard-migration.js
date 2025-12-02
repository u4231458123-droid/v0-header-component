// Supabase Utility Script
// Führt die Migration für die Dashboard-Stats aus

const { createClient } = require("@supabase/supabase-js")
const fs = require("fs")
const path = require("path")

// Lade Env
require("dotenv").config({ path: ".env.local" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Service Role für Admin-Rechte

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Fehlende Environment Variables: NEXT_PUBLIC_SUPABASE_URL oder SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMigration() {
  console.log("🚀 Starte Dashboard-Migration...")
  
  const migrationPath = path.join(__dirname, "../scripts/migrations/001_optimize_dashboard_stats.sql")
  const migrationSQL = fs.readFileSync(migrationPath, "utf-8")

  // Da wir keinen direkten SQL-Editor Zugriff haben, versuchen wir es via RPC wenn vorhanden
  // oder wir geben die SQL aus, die manuell ausgeführt werden muss.
  // Hier nutzen wir Postgres-Verbindung über pg (falls vorhanden) oder Supabase SQL API (nicht öffentlich)
  
  // Workaround: Nutze rpc 'exec_sql' falls es existiert (oft in Admin-Panels eingerichtet)
  // Ansonsten: Hinweis an User
  
  console.log("\n⚠️ BITTE FÜHREN SIE FOLGENDES SQL IM SUPABASE SQL EDITOR AUS:")
  console.log("=".repeat(60))
  console.log(migrationSQL)
  console.log("=".repeat(60))
  
  console.log("\n✅ Migration prepared.")
}

applyMigration()

