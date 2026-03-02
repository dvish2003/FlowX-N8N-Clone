import { IHTTPRequest, IExecution } from '@/models/workflowSchema';
import axios, { AxiosRequestConfig } from 'axios';
import { GoogleSheetService } from '@/lib/google-sheet/GoogleSheetService';


export interface HTTPExecutionResult {
  status: number;
  statusText: string;
  headers: Record<string, any>;
  data: any;
  executionTime: number;
  success: boolean;
  error?: string;
}

export async function executeHTTPRequest(
  config: IHTTPRequest,
  input?: Record<string, any>
): Promise<HTTPExecutionResult> {
  const startTime = Date.now();
  let lastError: any = null;
  let retryCount = 0;
  
  // Apply defaults for optional config values
  const timeout = (config.timeoutSeconds || 30) * 1000;
  const maxRetries = config.retries ?? 3;
  const method = config.method || 'GET';
  const url = config.url;
  
  console.log('[HTTP Request] Config:', { method, url, timeout: timeout/1000 + 's', retries: maxRetries });

  const requestConfig: AxiosRequestConfig = {
    method: method,
    url: url,
    timeout: timeout,
    validateStatus: () => true,
    maxRedirects: config.followRedirects !== false ? 5 : 0,
  };

  if (config.authentication !== 'none') {
    switch (config.authentication) {
      case 'basic':
        if (config.basicAuth) {
          const { username, password } = config.basicAuth;
          const encodedCredentials = Buffer.from(`${username}:${password}`).toString('base64');
          requestConfig.headers = {
            ...requestConfig.headers,
            Authorization: `Basic ${encodedCredentials}`,
          };
        }
        break;

      case 'bearer':
        if (config.bearerToken) {
          requestConfig.headers = {
            ...requestConfig.headers,
            Authorization: `Bearer ${config.bearerToken}`,
          };
        }
        break;

      case 'apikey':
        if (config.apiKey) {
          requestConfig.headers = {
            ...requestConfig.headers,
            [config.apiKey.key]: config.apiKey.value,
          };
        }
        break;
    }
  }

  if (config.sendHeaders && config.headers) {
    requestConfig.headers = {
      ...requestConfig.headers,
      ...config.headers,
    };
  }

  if (config.sendQueryParams && config.queryParams) {
    requestConfig.params = config.queryParams;
  }

  if (config.sendBody && config.body && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
    requestConfig.data = config.body;
  }

  while (retryCount <= maxRetries) {
    try {
      console.log(
        `[HTTP Request] Attempt ${retryCount + 1}/${maxRetries + 1}: ${method} ${url}`
      );

      const response = await axios(requestConfig);

      const executionTime = Date.now() - startTime;
      
      console.log('[HTTP Request] Response status:', response.status);
      console.log('[HTTP Request] Response data type:', typeof response.data);
      console.log('[HTTP Request] Response data preview:', JSON.stringify(response.data).substring(0, 300));

      return {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
        executionTime,
        success: response.status >= 200 && response.status < 300,
      };
    } catch (error: any) {
      lastError = error;
      retryCount++;

      if (retryCount <= maxRetries) {
        const delayMs = Math.pow(2, retryCount - 1) * 1000;
        console.log(`[HTTP Request] Retry ${retryCount} after ${delayMs}ms`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  const executionTime = Date.now() - startTime;
  const errorMessage = lastError?.message || 'Unknown error occurred';

  console.error(`[HTTP Request] Failed after ${maxRetries + 1} attempts: ${errorMessage}`);

  return {
    status: 0,
    statusText: 'Failed',
    headers: {},
    data: null,
    executionTime,
    success: false,
    error: errorMessage,
  };
}

export function calculateNextExecution(trigger: any, currentTime: Date = new Date()): Date {
  const next = new Date(currentTime);

  switch (trigger.triggerInterval) {
    case 'seconds':
      next.setSeconds(next.getSeconds() + parseInt(trigger.customSeconds || 1));
      break;

    case 'minutes':
      next.setMinutes(next.getMinutes() + parseInt(trigger.customMinutes || 1));
      break;

    case 'hours':
      next.setHours(next.getHours() + parseInt(trigger.customHours || 1));
      break;

    case 'days':
      next.setDate(next.getDate() + parseInt(trigger.daysBetween || 1));
      break;

    case 'weeks':
      next.setDate(next.getDate() + 7 * (parseInt(trigger.weeksBetween || 1)));
      break;

    case 'months':
      next.setMonth(next.getMonth() + parseInt(trigger.monthsBetween || 1));
      next.setDate(parseInt(trigger.triggerOnDay || 1));
      break;

    case 'custom':
      try {
        return getNextCronDate(trigger.cronExpression || '* * * * *', currentTime);
      } catch (err) {
        // Fallback if invalid cron
        next.setDate(next.getDate() + 1);
        return next;
      }
      break;

    default:
      next.setMinutes(next.getMinutes() + 1);
  }

  return next;
}

export function shouldTriggerRun(
  trigger: any,
  lastExecuted?: Date,
  currentTime: Date = new Date()
): boolean {
  if (!lastExecuted) {
    return true;
  }

  const timeSinceLastExecution = currentTime.getTime() - lastExecuted.getTime();

  switch (trigger.triggerInterval) {
    case 'seconds':
      return timeSinceLastExecution >= parseInt(trigger.customSeconds || 1) * 1000;

    case 'minutes':
      return timeSinceLastExecution >= parseInt(trigger.customMinutes || 1) * 60 * 1000;

    case 'hours':
      return timeSinceLastExecution >= parseInt(trigger.customHours || 1) * 60 * 60 * 1000;

    case 'days':
      return (
        timeSinceLastExecution >= parseInt(trigger.daysBetween || 1) * 24 * 60 * 60 * 1000
      );

    case 'weeks':
      return (
        timeSinceLastExecution >=
        7 * parseInt(trigger.weeksBetween || 1) * 24 * 60 * 60 * 1000
      );

    case 'months':
      const lastMonth = new Date(lastExecuted);
      lastMonth.setMonth(lastMonth.getMonth() + parseInt(trigger.monthsBetween || 1));
      return currentTime >= lastMonth;

    case 'custom':
      try {
        const nextExpected = getNextCronDate(trigger.cronExpression || '* * * * *', lastExecuted);
        return currentTime >= nextExpected;
      } catch (e) {
        return false;
      }

    default:
      return false;
  }
}

export function formatExecutionResult(result: HTTPExecutionResult) {
  return {
    status: result.status,
    statusText: result.statusText,
    headers: result.headers,
    data: result.data,
    executionTime: result.executionTime,
    success: result.success,
    timestamp: new Date().toISOString(),
    error: result.error || null,
  };
}

// Internal simple Cron Parser since we cannot install 'cron-parser'
function getNextCronDate(cron: string, fromDate: Date): Date {
  const parts = cron.match(/\S+/g) || [];
  if (parts.length < 5) {
     // Default fallback: 1 hour
     const d = new Date(fromDate);
     d.setHours(d.getHours() + 1);
     return d;
  }
  
  // Start checking from the next minute to avoid immediate re-trigger
  const next = new Date(fromDate);
  next.setMilliseconds(0);
  next.setSeconds(0);
  next.setMinutes(next.getMinutes() + 1);

  // Limit checks to ~1 month (approx 44k minutes) to prevent infinite loops
  const checkLimit = 44640; 
  let checks = 0;

  while (checks < checkLimit) {
      const minute = next.getMinutes();
      const hour = next.getHours();
      const day = next.getDate();
      const month = next.getMonth() + 1; // 1-12
      const dayOfWeek = next.getDay(); // 0-6

      if (
          matchCronPart(parts[0]!, minute) &&
          matchCronPart(parts[1]!, hour) &&
          matchCronPart(parts[2]!, day) &&
          matchCronPart(parts[3]!, month) &&
          matchCronPart(parts[4]!, dayOfWeek)
      ) {
          return next;
      }

      next.setMinutes(next.getMinutes() + 1);
      checks++;
  }
  
  // If no match found (unlikely), return 1 day from now
  const fallback = new Date(fromDate);
  fallback.setDate(fallback.getDate() + 1);
  return fallback;
}

function matchCronPart(part: string, value: number): boolean {
  if (part === '*') return true;
  
  // Step values: */5
  if (part.includes('/')) {
      const parts = part.split('/');
      const base = parts[0];
      const stepStr = parts[1]; // might be undefined if split fails, but includes check prevents it usually? no
      if (!stepStr) return false;
      
      const step = parseInt(stepStr);
      if (isNaN(step) || step === 0) return false;
      if (base === '*') {
          return value % step === 0;
      }
      return false; 
  }

  // Lists: 1,2,3
  if (part.includes(',')) {
      const list = part.split(',').map(s => parseInt(s));
      return list.includes(value);
  }

  // Ranges: 1-5
  if (part.includes('-')) {
      const [start, end] = part.split('-').map(s => parseInt(s));
      return value >= start && value <= end;
  }

  // Exact Match
  return parseInt(part) === value;
}
