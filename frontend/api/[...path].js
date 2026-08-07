/**
 * Vercel Serverless Proxy — forwards /api/** to Railway backend.
 *
 * Why this exists:
 *   A plain vercel.json proxy rewrite sends requests from Vercel's edge IPs.
 *   Railway's Cloudflare bot-protection sees those IPs as automated traffic
 *   and returns 429 / challenge pages.
 *
 *   This function forwards the browser's real User-Agent and X-Forwarded-For
 *   headers so Cloudflare recognises the request as originating from a real user.
 */

const RAILWAY_BASE =
  process.env.RAILWAY_API_URL ||
  'https://personalcarbonfootprintapplication-production.up.railway.app';

export default async function handler(req, res) {
  // Build the target path
  const segments = req.query.path;
  const pathStr = Array.isArray(segments) ? segments.join('/') : segments || '';

  // Re-build the query string (strip Vercel's internal "path" param)
  const qs = new URLSearchParams();
  for (const [key, val] of Object.entries(req.query)) {
    if (key === 'path') continue;
    Array.isArray(val) ? val.forEach(v => qs.append(key, v)) : qs.append(key, val);
  }

  const targetUrl = `${RAILWAY_BASE}/api/${pathStr}${qs.toString() ? '?' + qs.toString() : ''}`;

  // Short-circuit OPTIONS preflight immediately
  if (req.method.toUpperCase() === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    return res.status(200).end();
  }

  // Forward the browser's own headers so Cloudflare sees a real user
  const forwardHeaders = {};

  const pass = [
    'user-agent',
    'accept',
    'accept-language',
    'accept-encoding',
    'content-type',
    'authorization',
    'x-forwarded-for',
    'x-real-ip',
    'referer',
    'origin',
  ];

  for (const h of pass) {
    const v = req.headers[h];
    if (v) forwardHeaders[h] = v;
  }

  // Always send content-type for POST/PUT/PATCH
  if (!forwardHeaders['content-type']) {
    forwardHeaders['content-type'] = 'application/json';
  }

  const hasBody = !['GET', 'HEAD'].includes(req.method.toUpperCase());

  try {
    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body: hasBody ? JSON.stringify(req.body) : undefined,
    });

    const text = await upstream.text();
    const ct = upstream.headers.get('content-type');

    if (ct) res.setHeader('Content-Type', ct);
    return res.status(upstream.status).send(text);
  } catch (err) {
    console.error('[proxy] upstream error:', err.message);
    return res.status(502).json({
      message: 'Backend is temporarily unavailable. Please try again in a moment.',
      error: err.message,
    });
  }
}

export const config = {
  api: {
    bodyParser: true,
    externalResolver: true,
  },
};
