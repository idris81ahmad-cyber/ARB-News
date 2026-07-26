import type { NewsCategory } from '@/types/article';

const KEYWORD_MAP: { category: NewsCategory; patterns: RegExp[] }[] = [
  {
    category: 'Sports',
    patterns: [
      /\b(sport|football|soccer|afcon|eagles|npfl|basketball|tennis|athletics|olympic)\b/i,
    ],
  },
  {
    category: 'Entertainment',
    patterns: [
      /\b(entertainment|music|nollywood|afrobeats|movie|film|celebrity|grammy|concert)\b/i,
    ],
  },
  {
    category: 'Business',
    patterns: [
      /\b(business|market|stock|naira|bank|economy|trade|fintech|startup|oil|gdp)\b/i,
    ],
  },
  {
    category: 'Environment',
    patterns: [
      /\b(climate|environment|flood|drought|pollution|tree|green|renewable|weather)\b/i,
    ],
  },
  {
    category: 'Culture',
    patterns: [
      /\b(culture|festival|heritage|tradition|carnival|art|museum|language)\b/i,
    ],
  },
  {
    category: 'Politics',
    patterns: [
      /\b(politic|president|governor|senate|election|government|minister|policy|law|court)\b/i,
    ],
  },
];

/** Map free-text / provider category labels onto ARB News categories. */
export function inferCategory(
  text: string,
  providerCategory?: string | null,
): NewsCategory {
  const provider = (providerCategory ?? '').toLowerCase();

  if (provider.includes('sport')) return 'Sports';
  if (provider.includes('entertain')) return 'Entertainment';
  if (provider.includes('business') || provider.includes('technology')) {
    return 'Business';
  }
  if (provider.includes('health') || provider.includes('science')) {
    return 'Environment';
  }
  if (provider.includes('general') || provider.includes('politics')) {
    // fall through to keyword scan for finer grain
  }

  const haystack = `${providerCategory ?? ''} ${text}`;
  for (const entry of KEYWORD_MAP) {
    if (entry.patterns.some((re) => re.test(haystack))) {
      return entry.category;
    }
  }

  return 'Politics';
}
