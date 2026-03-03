/**
 * Proxy /media/* to backend. Uses BACKEND_URL_INTERNAL in Docker so the Next server
 * can reach the backend container; falls back to NEXT_PUBLIC_BACKEND_URL or localhost otherwise.
 */
import { NextResponse } from 'next/server';

const backendBase =
  process.env.BACKEND_URL_INTERNAL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'http://localhost:8000';

export async function GET(request, context) {
  const params = await context.params;
  const path = params?.path;
  const pathSegments = Array.isArray(path) ? path.join('/') : path || '';
  const mediaPath = pathSegments ? `/${pathSegments}` : '';
  const url = `${backendBase}/media${mediaPath}${new URL(request.url).search || ''}`;

  try {
    // Do not forward browser Host header so the backend receives a request it can accept (e.g. backend:8000 in Docker)
    const fetchHeaders = new Headers();
    const accept = request.headers.get('accept');
    if (accept) fetchHeaders.set('accept', accept);

    const res = await fetch(url, {
      method: 'GET',
      headers: fetchHeaders,
      cache: 'no-store',
    });
    const headers = new Headers();
    const contentType = res.headers.get('content-type');
    if (contentType) headers.set('content-type', contentType);
    const contentLength = res.headers.get('content-length');
    if (contentLength) headers.set('content-length', contentLength);
    return new NextResponse(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers,
    });
  } catch (e) {
    return new NextResponse('Backend unreachable', { status: 502 });
  }
}
