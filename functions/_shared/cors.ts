// ─────────────────────────────────────────────
// functions/_shared/cors.ts
// CORS + JSON 响应工具
// ─────────────────────────────────────────────

export const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Student-Id',
  'Access-Control-Max-Age': '86400',
};

export function jsonResponse(data: any, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders,
      ...init.headers,
    },
  });
}

export function errorResponse(message: string, status = 500, details?: any): Response {
  return jsonResponse({ error: message, details }, { status });
}

export function handleOptions(): Response {
  return new Response(null, { status: 204, headers: corsHeaders });
}

// 验证 CORS preflight
export function preflight(request: Request): Response | null {
  if (request.method === 'OPTIONS') return handleOptions();
  return null;
}
