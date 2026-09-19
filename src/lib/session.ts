/**
 * Ephemeral session ID management.
 *
 * IMPORTANT: This is a correlation identifier, NOT an authentication credential.
 * It is generated once per browser session and lives in sessionStorage so it
 * does not persist across tab closes. It is used to correlate reports, trips,
 * and trusted contacts with this browser session.
 *
 * When BE-01 (server-side authentication) lands, this will be replaced by a
 * server-issued session token. The abstraction here ensures that all call sites
 * import from a single location and can be updated without grep-and-replace.
 */

const SESSION_KEY = "saferpath_session_id";

function generateSessionId(): string {
  const arr = new Uint8Array(24);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Returns the stable ephemeral session ID for this browser session.
 * Creates one if none exists yet.
 */
export function getSessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing && existing.length >= 16) return existing;
    const id = generateSessionId();
    sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    // sessionStorage unavailable (private browsing restrictions, etc.)
    return generateSessionId();
  }
}

/**
 * Generates a unique idempotency key for a single request.
 * Each call returns a fresh key — callers must store and re-use the same key
 * for retry attempts on the same logical request.
 */
export function generateIdempotencyKey(): string {
  return `idem-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Generates a unique event ID for trip event submissions.
 */
export function generateEventId(): string {
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
