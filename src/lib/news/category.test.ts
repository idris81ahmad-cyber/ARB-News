import { describe, expect, it } from 'vitest';
import { inferCategory } from '@/lib/news/category';

describe('inferCategory', () => {
  it('detects Super Eagles as sports not politics', () => {
    expect(
      inferCategory(
        'Super Eagles train ahead of AFCON fixture as federation meets government',
      ),
    ).toBe('Sports');
  });

  it('detects NPFL as sports', () => {
    expect(inferCategory('NPFL title race heats up in Lagos')).toBe('Sports');
  });

  it('detects business / naira', () => {
    expect(inferCategory('Naira strengthens as CBN and banks report profits')).toBe(
      'Business',
    );
  });

  it('detects entertainment / afrobeats', () => {
    expect(inferCategory('Wizkid and Afrobeats stars sell out London')).toBe(
      'Entertainment',
    );
  });

  it('detects politics', () => {
    expect(
      inferCategory('Senate passes bill as Tinubu meets governors in Abuja'),
    ).toBe('Politics');
  });

  it('detects environment floods', () => {
    expect(
      inferCategory('Flooding displaces thousands after heavy rainfall in Kano'),
    ).toBe('Environment');
  });

  it('detects culture carnival', () => {
    expect(inferCategory('Calabar carnival draws millions of tourists')).toBe(
      'Culture',
    );
  });

  it('uses provider category hints', () => {
    expect(inferCategory('Weekly roundup', 'Sports Desk')).toBe('Sports');
  });
});
