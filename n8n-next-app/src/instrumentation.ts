export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initializeScheduler } = await import('@/lib/workflow/scheduler');
    
    await initializeScheduler({
      checkIntervalMs: 5000,
      maxConcurrentExecutions: 5
    });
    
    console.log('[Instrumentation] Scheduler initialized');
  }
}
