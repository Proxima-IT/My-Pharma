/**
 * Global Image Loader
 * Normalizes backend media URLs to the frontend proxy path so images load
 * via Next.js rewrite (same-origin). Use getMediaUrl for the same logic outside Image src.
 */
import { getMediaUrl } from '@/app/(shared)/lib/apiConfig';

export default function myPharmaImageLoader({ src }) {
  if (!src) return src;
  const normalized = getMediaUrl(src);
  return normalized;
}
