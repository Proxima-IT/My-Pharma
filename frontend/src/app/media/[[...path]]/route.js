/**
 * Proxy /media/* to backend.
 *
 * Works in both:
 * - Docker production (BACKEND_URL_INTERNAL=http://backend:8000)
 * - Local dev (host backend ports such as 8080/8000)
 * - Custom deployments using NEXT_PUBLIC_BACKEND_URL or NEXT_PUBLIC_API_URL
 */
import { NextResponse } from 'next/server';

const DEFAULT_BACKEND_BASES = [
  'http://localhost:8080',
  'http://localhost:8000',
];

const normalizeBase = value => (value || '').trim().replace(/\/+$/, '');

const stripApiSuffix = value => {
  const base = normalizeBase(value);
  if (!base) return '';
  return base.replace(/\/api\/?$/i, '');
};

const addUnique = (arr, value) => {
  const normalized = stripApiSuffix(value);
  if (!normalized) return;
  if (!arr.includes(normalized)) arr.push(normalized);
};

const getBackendBaseCandidates = () => {
  const candidates = [];

  // Runtime server-to-server route inside containers.
  addUnique(candidates, process.env.BACKEND_URL_INTERNAL);
  // Public backend base if explicitly provided.
  addUnique(candidates, process.env.NEXT_PUBLIC_BACKEND_URL);
  // Derive backend base from API URL when only API URL is configured.
  addUnique(candidates, process.env.NEXT_PUBLIC_API_URL);

  for (const fallback of DEFAULT_BACKEND_BASES) {
    addUnique(candidates, fallback);
  }

  return candidates;
};

const makeMediaUrl = (backendBase, requestUrl, mediaPath) => {
  const query = new URL(requestUrl).search || '';
  return `${backendBase}/media${mediaPath}${query}`;
};

const fetchFromBackend = async (url, request) => {
  // Do not forward browser Host header so the backend receives a request it can accept.
  const fetchHeaders = new Headers();
  const accept = request.headers.get('accept');
  if (accept) fetchHeaders.set('accept', accept);

  return fetch(url, {
    method: 'GET',
    headers: fetchHeaders,
    cache: 'no-store',
  });
};

export async function GET(request, context) {
  const params = await context.params;
  const path = params?.path;
  const pathSegments = Array.isArray(path) ? path.join('/') : path || '';
  const mediaPath = pathSegments ? `/${pathSegments}` : '';
  const requestOrigin = new URL(request.url).origin;
  const backendCandidates = getBackendBaseCandidates();

  let lastError = null;

  for (const backendBase of backendCandidates) {
    // Prevent recursive self-proxy loops (e.g. NEXT_PUBLIC_API_URL points to frontend origin).
    if (backendBase === requestOrigin) {
      continue;
    }
    const url = makeMediaUrl(backendBase, request.url, mediaPath);
    try {
      const res = await fetchFromBackend(url, request);
      // Candidate replied but upstream is unavailable; try next candidate.
      if ([502, 503, 504].includes(res.status)) {
        continue;
      }
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
      lastError = e;
    }
  }

  if (lastError) {
    console.error('Media proxy failed for all backend candidates:', lastError);
  }
  if (!backendCandidates.length) {
    console.error('Media proxy has no backend candidates configured.');
  }

  {
    return new NextResponse('Backend unreachable', { status: 502 });
  }
}
