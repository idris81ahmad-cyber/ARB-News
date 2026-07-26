/** Rough reading-time estimate (~200 wpm). */
export function estimateReadingTime(text: string, wpm = 200): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / wpm));
}
