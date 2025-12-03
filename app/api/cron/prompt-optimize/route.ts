import { NextResponse } from 'next/server';

/**
 * Cron-Endpoint für Prompt-Optimierung
 * Wird täglich um 4:00 UTC ausgeführt
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
    // Importiere Prompt-Optimization-Bot dynamisch
    const { PromptOptimizationBot } = await import('@/lib/ai/bots/prompt-optimization-bot');
    const promptBot = new PromptOptimizationBot();
    
    // Lade Support-Bot Wissen und Test-Ergebnisse
    await promptBot.loadSupportBotKnowledge();
    await promptBot.loadTestResults();
    
    // Führe kontinuierliche Prompt-Optimierung aus
    const results = await promptBot.continuousOptimization();
    
    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      task: 'prompt-optimization',
      results,
    });
  } catch (error: any) {
    console.error('Fehler bei Prompt-Optimierung:', error);
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
