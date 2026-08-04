/**
 * ImageKit transformation helper for optimized web delivery
 * Original upload URLs are preserved for full-resolution view (e.g. lightbox, zoom).
 * Optimized responsive variants (w-800, q-80, f-auto) are served in feeds and carousels.
 */
export const getOptimizedImageUrl = (url, width = 800, quality = 80) => {
  if (!url || typeof url !== 'string') return url;

  if (url.includes('imagekit.io')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}tr=w-${width},q-${quality},f-auto`;
  }

  return url;
};
