const MAX_CHARS = 8000;
const FETCH_TIMEOUT_MS = 10_000;

// Tags whose entire contents are noise, not article text.
const STRIP_TAG_PATTERN = /<(script|style|noscript|nav|header|footer|form|aside)[\s\S]*?<\/\1>/gi;

const HTML_ENTITIES: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&lt;': '<',
  '&gt;': '>',
};

function decodeEntities(text: string): string {
  return text.replace(/&nbsp;|&amp;|&quot;|&#39;|&apos;|&lt;|&gt;/g, (entity) => HTML_ENTITIES[entity]);
}

function stripTags(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

/**
 * Pulls the best-effort "main content" region out of the raw HTML before
 * stripping tags, so boilerplate (nav links, footers, cookie banners) don't
 * dilute what gets sent to the model. Falls back to the whole document if
 * no <article>/<main> is present — plenty of sites still render real
 * content server-side even without one.
 */
function extractMainHtml(html: string): string {
  const article = html.match(/<article[\s\S]*?<\/article>/i);
  if (article) return article[0];

  const main = html.match(/<main[\s\S]*?<\/main>/i);
  if (main) return main[0];

  return html;
}

/**
 * Fetches a URL and reduces the HTML to plain text for prompting: drops
 * script/style/nav/footer noise, prefers the <article>/<main> region when
 * present, decodes entities, collapses whitespace, and truncates so a long
 * page doesn't blow the model's context window.
 */
export async function fetchPageText(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let html: string;
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AILearningRadar/1.0)',
        Accept: 'text/html',
      },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`Could not fetch ${url} (${response.status})`);
    }
    html = await response.text();
  } finally {
    clearTimeout(timeout);
  }

  const cleanedHtml = extractMainHtml(html).replace(STRIP_TAG_PATTERN, ' ');
  const text = stripTags(cleanedHtml);

  if (!text) {
    throw new Error(`No readable content found at ${url}`);
  }

  return text.slice(0, MAX_CHARS);
}
