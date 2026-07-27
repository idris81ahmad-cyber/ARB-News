import { describe, expect, it } from 'vitest';
import { stableIdFromString } from '@/lib/news/id';

describe('stableIdFromString', () => {
  it('returns a positive integer', () => {
    const id = stableIdFromString('https://punchng.com/example');
    expect(id).toBeGreaterThan(0);
    expect(Number.isInteger(id)).toBe(true);
  });

  it('is stable for the same input', () => {
    const a = stableIdFromString('https://example.com/a');
    const b = stableIdFromString('https://example.com/a');
    expect(a).toBe(b);
  });

  it('differs for different urls', () => {
    const a = stableIdFromString('https://example.com/a');
    const b = stableIdFromString('https://example.com/b');
    expect(a).not.toBe(b);
  });
});
