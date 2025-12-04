import { NextResponse } from 'next/server';

/**
 * Cron-Endpoint für erweiterte Optimierungen
 * Wird wöchentlich am Sonntag um 3:00 UTC ausgeführt
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
    // Importiere System-Bot und Quality-Bot dynamisch
    const { SystemBot } = await import('@/lib/ai/bots/system-bot');
    const { QualityBot } = await import('@/lib/ai/bots/quality-bot');
    
    const systemBot = new SystemBot();
    const qualityBot = new QualityBot();
    
    // Führe erweiterte Optimierungen aus
    const task = {
      id: `optimize-${Date.now()}`,
      type: 'optimization' as const,
      description: 'Erweiterte Codebase-Optimierungen',
      area: 'system-maintenance',
    };
    
    const optimizationResults = await systemBot.executeWithRecovery(task);
    
    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      task: 'advanced-optimizations',
      results: {
        optimization: optimizationResults,
      },
    });
  } catch (error: any) {
    console.error('Fehler bei erweiterten Optimierungen:', error);
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

