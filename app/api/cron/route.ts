import { NextResponse } from 'next/server';

/**
 * Haupt-Cron-Endpoint für Vercel Cron Jobs
 * Validiert CRON_SECRET für Sicherheit
 */
export async function GET(request: Request) {
  // Sicherheitsvalidierung: Prüfe CRON_SECRET
  const authHeader = request.headers.get('Authorization');
  const expectedSecret = process.env.CRON_SECRET;
  
  if (!expectedSecret) {
    console.error('CRON_SECRET ist nicht gesetzt');
    return NextResponse.json(
      { error: 'Cron-Konfiguration fehlt' },
      { status: 500 }
    );
  }
  
  if (authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Standard-Cron-Antwort
  return NextResponse.json({ 
    ok: true,
    timestamp: new Date().toISOString(),
    message: 'Cron job executed successfully'
  });
}

