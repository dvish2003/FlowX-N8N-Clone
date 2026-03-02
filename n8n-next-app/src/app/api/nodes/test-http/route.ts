import { NextRequest, NextResponse } from 'next/server';
import { executeHTTPRequest, formatExecutionResult } from '@/lib/workflow/executionEngine';

export async function POST(request: NextRequest) {
  try {
    const config = await request.json();

    if (!config) {
      return NextResponse.json(
        { error: 'Configuration is required' },
        { status: 400 }
      );
    }

    console.log(`[Test HTTP] Testing request configuration for: ${config.method} ${config.url}`);

    const result = await executeHTTPRequest(config, {});

    const formattedResult = formatExecutionResult(result);

    return NextResponse.json({
      success: result.success,
      data: formattedResult,
    });
  } catch (error: any) {
    console.error('[Test HTTP] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Test execution failed' },
      { status: 500 }
    );
  }
}
