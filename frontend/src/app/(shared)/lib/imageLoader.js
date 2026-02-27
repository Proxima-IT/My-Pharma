/**
 * Global Image Loader
 * Automatically strips the backend domain from absolute URLs
 * to ensure images load via the local proxy.
 */
export default function myPharmaImageLoader({ src }) {
  // If the URL contains the backend media path, strip the domain
  if (src && src.includes('/media/')) {
    const relativePath = src.split('/media/')[1];
    return `/media/${relativePath}`;
  }

  // Return the original src for other images (like local assets)
  return src;
}
