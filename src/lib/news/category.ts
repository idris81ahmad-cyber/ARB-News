import type { NewsCategory } from '@/types/article';

type Rule = {
  category: NewsCategory;
  weight: number;
  patterns: RegExp[];
};

/**
 * Ordered, weighted rules. Higher total score wins.
 * Sports/Entertainment checked with strong Naija-specific signals so they
 * aren't swallowed by generic "government/politics" wording.
 */
const RULES: Rule[] = [
  {
    category: 'Sports',
    weight: 4,
    patterns: [
      /\b(super eagles|eagles|afcon|npfl|nwsl|fifa|uefa|champions league)\b/i,
      /\b(football|soccer|match|fixture|striker|goalkeeper|midfielder|coach|manager)\b/i,
      /\b(basketball|d\s*'?\s*tigers|athletics|boxing|wrestling|tennis|olympic|medal|tournament|league table|transfer)\b/i,
      /\b(sports?|sporting)\b/i,
    ],
  },
  {
    category: 'Entertainment',
    weight: 4,
    patterns: [
      /\b(nollywood|afrobeats?|afrobeat|burna|wizkid|davido|tems|rema|asake)\b/i,
      /\b(music|album|single|concert|tour|grammy|oscar|film|movie|cinema|actor|actress|celebrity)\b/i,
      /\b(entertainment|showbiz|netflix|streaming series|premiere)\b/i,
    ],
  },
  {
    category: 'Business',
    weight: 3,
    patterns: [
      /\b(naira|cbn|fintech|startup|ipo|stock market|equities|inflation|gdp|fx|forex|bank|banking)\b/i,
      /\b(business|economy|economic|trade|commerce|investment|investor|oil price|nnpc|sec nigeria)\b/i,
      /\b(market cap|revenue|profit|sme|export|import|crypto|bitcoin)\b/i,
    ],
  },
  {
    category: 'Environment',
    weight: 3,
    patterns: [
      /\b(climate|flood|flooding|drought|pollution|deforestation|desertification|erosion)\b/i,
      /\b(environment(al)?|renewable|solar|emissions|wildlife|reforestation|green economy)\b/i,
      /\b(weather|rainfall|heatwave|lagoon pollution|oil spill)\b/i,
    ],
  },
  {
    category: 'Culture',
    weight: 3,
    patterns: [
      /\b(calabar carnival|culture|cultural|heritage|tradition|festival|masquerade)\b/i,
      /\b(museum|gallery|language|yoruba|igbo|hausa|efik|literature|poetry|art exhibition)\b/i,
    ],
  },
  {
    category: 'Politics',
    weight: 2,
    patterns: [
      /\b(president|presidency|tinubu|governor|deputy governor|senate|senator|house of reps|national assembly)\b/i,
      /\b(election|inec|campaign|party|apc|pdp|labour party|minister|ministry|cabinet|policy)\b/i,
      /\b(politic(s|al)?|government|lawmaker|bill passed|impeach|constitution|court ruling|efcc|icpc)\b/i,
    ],
  },
];

function scoreCategory(haystack: string, rule: Rule): number {
  let hits = 0;
  for (const re of rule.patterns) {
    if (re.test(haystack)) hits += 1;
  }
  return hits * rule.weight;
}

/** Map free-text / provider category labels onto ARB News categories. */
export function inferCategory(
  text: string,
  providerCategory?: string | null,
): NewsCategory {
  const provider = (providerCategory ?? '').toLowerCase();
  const haystack = `${providerCategory ?? ''} ${text}`.toLowerCase();

  // Strong provider labels still win when unambiguous
  if (/\bsport/i.test(provider)) return 'Sports';
  if (/entertain|celebrity|music|film/i.test(provider)) return 'Entertainment';
  if (/business|technolog|finance|market/i.test(provider)) return 'Business';
  if (/health|science|climate|environment/i.test(provider)) return 'Environment';
  if (/culture|lifestyle|travel/i.test(provider) && !/politic/i.test(provider)) {
    return 'Culture';
  }

  let best: NewsCategory = 'Politics';
  let bestScore = 0;

  for (const rule of RULES) {
    const s = scoreCategory(haystack, rule);
    if (s > bestScore) {
      bestScore = s;
      best = rule.category;
    }
  }

  // Tie-break: if sports and politics both mention "government" style noise,
  // prefer sports when clear sports tokens exist.
  if (
    best === 'Politics' &&
    /\b(super eagles|afcon|npfl|football match|goal scored|fixture)\b/i.test(haystack)
  ) {
    return 'Sports';
  }

  return bestScore > 0 ? best : 'Politics';
}
