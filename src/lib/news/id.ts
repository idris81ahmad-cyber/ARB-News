/** Stable positive integer id derived from a string (e.g. article URL). */
export function stableIdFromString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  // Keep in a safe positive 31-bit range
  return (hash >>> 0) % 2_147_483_647 || 1;
}
