import { NextResponse } from 'next/server';

/**
 * Cron-Endpoint für automatische Bug-Fixes
 * Wird alle 2 Stunden und täglich um 3:00 UTC ausgeführt
 */
export async function GET(request: Request) {
  // Sicherheitsvalidierung
  const authHeader = request.headers.get('Authorization');
  const expectedSecret = process.env.CRON_SECRET;
  
  if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    // Importiere System-Bot dynamisch
    const { SystemBot } = await import('@/lib/ai/bots/system-bot');
    const systemBot = new SystemBot();
    
    // Führe automatische Bug-Fixes aus
    // Erstelle ein generisches Task für Codebase-Analyse
    const task = {
      id: `auto-fix-${Date.now()}`,
      type: 'bug-fix' as const,
      description: 'Automatische Bug-Fixes für gesamte Codebase',
    };
    
    const results = await systemBot.fixBugs(task);
    
    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      task: 'auto-fix-bugs',
      results,
    });
  } catch (error: any) {
    console.error('Fehler beim Auto-Fix:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

