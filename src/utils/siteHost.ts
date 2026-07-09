/**
 * Extracts a URL's hostname for use as a display-friendly source label
 * (e.g. "dev.to", "reactdevelopment.substack.com"), stripped of a leading
 * "www.". Returns null for an empty/invalid URL rather than throwing.
 */
export function getSiteHost(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}
