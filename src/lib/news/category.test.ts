import { describe, expect, it } from 'vitest';
import { inferCategory } from '@/lib/news/category';

describe('inferCategory', () => {
  it('detects sports', () => {
    expect(inferCategory('Super Eagles win AFCON qualifier')).toBe('Sports');
  });

  it('detects business', () => {
    expect(inferCategory('Naira strengthens as banks report profits')).toBe(
      'Business',
    );
  });

  it('detects entertainment', () => {
    expect(inferCategory('Nollywood premiere and Afrobeats concert')).toBe(
      'Entertainment',
    );
  });

  it('uses provider category hints', () => {
    expect(inferCategory('Weekly roundup', 'Sports Desk')).toBe('Sports');
  });

  it('defaults to politics when unclear', () => {
    expect(inferCategory('Update from the capital')).toBe('Politics');
  });
});
