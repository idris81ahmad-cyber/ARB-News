import { describe, expect, it } from 'vitest';
import { estimateReadingTime } from '@/lib/reading-time';

describe('estimateReadingTime', () => {
  it('returns at least 1 minute', () => {
    expect(estimateReadingTime('short')).toBe(1);
  });

  it('scales with word count', () => {
    const words = Array.from({ length: 400 }, () => 'word').join(' ');
    expect(estimateReadingTime(words)).toBe(2);
  });
});
