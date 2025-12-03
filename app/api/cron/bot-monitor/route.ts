import { NextResponse } from 'next/server';

/**
 * Cron-Endpoint für Bot-Monitoring
 * Wird alle 2 Stunden ausgeführt
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
    // Importiere BotMonitor dynamisch
    const { BotMonitor } = await import('@/lib/cicd/bot-monitor');
    const monitor = new BotMonitor();
    
    // Führe Health-Checks für alle Bots aus
    const healthChecks = await monitor.performAllHealthChecks();
    const metrics = await monitor.getMetrics();
    
    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      task: 'bot-monitoring',
      results: {
        healthChecks,
        metrics,
      },
    });
  } catch (error: any) {
    console.error('Fehler beim Bot-Monitoring:', error);
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

