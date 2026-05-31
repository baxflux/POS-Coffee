/**
 * Tiny id and ticket-number helpers.
 *
 * The MVP has no backend, so ids are generated client-side. `crypto.randomUUID`
 * is preferred where available (modern browsers + Node 18+); a counter-based
 * fallback exists for older environments and SSR safety.
 */

let fallbackCounter = 0

export function createId(prefix = "id"): string {
  if (typeof globalThis !== "undefined" && globalThis.crypto?.randomUUID) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`
  }
  fallbackCounter += 1
  return `${prefix}-${Date.now().toString(36)}-${fallbackCounter}`
}

/**
 * Format a sequential order count as a ticket number (e.g. `T-0042`).
 * Used by the orders store when a new order is checked out.
 */
export function formatTicketNumber(sequence: number): string {
  const padded = String(sequence).padStart(4, "0")
  return `T-${padded}`
}
