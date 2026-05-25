/**
 * Proxy /media/* to backend.
 *
 * Works in both:
 * - Docker production (BACKEND_URL_INTERNAL=http://backend:8000)
 * - Local dev (host backend ports such as 8000/8080)
 * - Custom deployments using NEXT_PUBLIC_BACKEND_URL or NEXT_PUBLIC_API_URL
 */
import { NextResponse } from 'next/server';

const DEFAULT_BACKEND_BASES = [
  'http://localhost:8000',
  'http://localhost:8080',
];
const DEFAULT_MEDIA_FALLBACK_IMAGE = '/assets/images/my-pharma-logo.png';
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.avif'];

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
  // Optional dedicated media host for environments where API and media differ.
  addUnique(candidates, process.env.NEXT_PUBLIC_MEDIA_FALLBACK_URL);

  for (const fallback of DEFAULT_BACKEND_BASES) {
    addUnique(candidates, fallback);
  }

  return candidates;
};

const isImageRequest = (request, mediaPath) => {
  const accept = (request.headers.get('accept') || '').toLowerCase();
  if (accept.includes('image/')) return true;
  const lowerPath = (mediaPath || '').toLowerCase();
  return IMAGE_EXTENSIONS.some(ext => lowerPath.endsWith(ext));
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
  const shouldUseImageFallback = isImageRequest(request, mediaPath);

  let lastError = null;
  let lastNotFoundResponse = null;

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
      // If one backend does not have the file, try the next candidate.
      if (res.status === 404) {
        lastNotFoundResponse = res;
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

  // Final fallback for missing images so UI stays stable in both dev/prod.
  if (shouldUseImageFallback) {
    const fallbackUrl = new URL(DEFAULT_MEDIA_FALLBACK_IMAGE, request.url);
    return NextResponse.redirect(fallbackUrl, { status: 307 });
  }

  if (lastNotFoundResponse) {
    return new NextResponse(lastNotFoundResponse.body, {
      status: 404,
      statusText: lastNotFoundResponse.statusText || 'Not Found',
    });
  }

  {
    return new NextResponse('Backend unreachable', { status: 502 });
  }
}
