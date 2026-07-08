const MIN_LATENCY_MS = 500;
const MAX_LATENCY_MS = 900;
const ERROR_RATE = 0.12;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Simulates a real upstream round-trip (Hacker News / DEV.to / Medium /
 * an LLM call): variable latency plus an occasional failure, so the
 * client's loading/error states exercise real branches instead of being
 * purely cosmetic. Only used on the two endpoints that stand in for an
 * external call — plain CRUD against the repository stays fast.
 */
export async function simulateUpstreamCall(errorMessage: string): Promise<void> {
  const latency = MIN_LATENCY_MS + Math.random() * (MAX_LATENCY_MS - MIN_LATENCY_MS);
  await delay(latency);
  if (Math.random() < ERROR_RATE) {
    throw new Error(errorMessage);
  }
}
