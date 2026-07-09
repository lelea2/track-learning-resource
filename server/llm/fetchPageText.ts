const MAX_CHARS = 6000;

/**
 * Fetches a URL and reduces the HTML to plain text for prompting: strips
 * script/style blocks and tags, collapses whitespace, and truncates so a
 * long article doesn't blow the model's context window.
 */
export async function fetchPageText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AILearningRadar/1.0)' },
  });
  if (!response.ok) {
    throw new Error(`Could not fetch ${url} (${response.status})`);
  }

  const html = await response.text();
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!text) {
    throw new Error(`No readable content found at ${url}`);
  }

  return text.slice(0, MAX_CHARS);
}
