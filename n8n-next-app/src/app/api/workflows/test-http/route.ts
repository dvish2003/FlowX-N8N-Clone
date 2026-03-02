import { NextRequest, NextResponse } from 'next/server';
import { executeHTTPRequest } from '@/lib/workflow/executionEngine';

/**
 * POST /api/workflows/test-http
 * Test an HTTP request and return the raw data for column detection
 */
export async function POST(request: NextRequest) {
  try {
    const config = await request.json();

    if (!config || !config.url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    console.log(`[Test HTTP] Testing: ${config.method || 'GET'} ${config.url}`);

    // Build the request config with defaults
    const httpConfig = {
      method: config.method || 'GET',
      url: config.url,
      headers: config.headers || {},
      queryParams: config.queryParams || {},
      body: config.body,
      authentication: config.authentication || 'none',
      basicAuth: config.basicAuth,
      bearerToken: config.bearerToken,
      apiKey: config.apiKey,
      timeoutSeconds: 30,
      retries: 0, // No retries for testing
      followRedirects: true,
      sendBody: ['POST', 'PUT', 'PATCH'].includes(config.method || 'GET'),
      sendHeaders: Object.keys(config.headers || {}).length > 0,
      sendQueryParams: Object.keys(config.queryParams || {}).length > 0,
    };

    const result = await executeHTTPRequest(httpConfig as any, {});

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || `HTTP ${result.status}: ${result.statusText}`,
        status: result.status
      });
    }

    // Return the raw data for column detection
    return NextResponse.json({
      success: true,
      data: result.data,
      status: result.status,
      executionTime: result.executionTime
    });

  } catch (error: any) {
    console.error('[Test HTTP] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Test execution failed' },
      { status: 500 }
    );
  }
}
