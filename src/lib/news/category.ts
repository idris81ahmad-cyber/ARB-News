import type { NewsCategory } from '@/types/article';

type Rule = {
  category: NewsCategory;
  /** Multiplier per matching pattern group */
  weight: number;
  patterns: RegExp[];
  /** Extra points when ANY of these high-signal patterns match */
  boosts?: RegExp[];
};

/**
 * Weighted multi-signal classifier for Nigerian news.
 * Strong sport/entertainment signals beat weak politics noise.
 */
const RULES: Rule[] = [
  {
    category: 'Sports',
    weight: 4,
    patterns: [
      /\b(super eagles|flying eagles|falcons|d\s*'?\s*tigers|npfl|afcon|caf)\b/i,
      /\b(football|soccer|fixture|striker|goalkeeper|midfielder|winger|hat-?trick)\b/i,
      /\b(basketball|athletics|boxing|wrestling|tennis|olympic|medal|tournament|transfer window)\b/i,
      /\b(league table|matchday|full[- ]time|half[- ]time|penalty kick|offside)\b/i,
      /\b(sports?|sporting)\b/i,
    ],
    boosts: [
      /\b(super eagles|afcon|npfl|caf champions|premier league fixture)\b/i,
    ],
  },
  {
    category: 'Entertainment',
    weight: 4,
    patterns: [
      /\b(nollywood|afrobeats?|afrobeat|burna boy|wizkid|davido|tems|rema|asake|ayra starr)\b/i,
      /\b(music|album|ep\b|single|concert|tour|grammy|oscar|film|movie|cinema|actor|actress)\b/i,
      /\b(entertainment|showbiz|netflix|streaming series|premiere|box office|celebrity)\b/i,
      /\b(comedian|skit maker|influencer|fashion week|red carpet)\b/i,
    ],
    boosts: [/\b(nollywood|afrobeats?|grammy|wizkid|davido|burna)\b/i],
  },
  {
    category: 'Business',
    weight: 3,
    patterns: [
      /\b(naira|cbn|fintech|startup|ipo|equities|inflation|gdp|forex|fx market)\b/i,
      /\b(business|economy|economic|trade|commerce|investment|investor|oil price|nnpc)\b/i,
      /\b(bank|banking|sme|export|import|crypto|bitcoin|sec nigeria|stock exchange|ngx)\b/i,
      /\b(revenue|profit|market cap|interest rate|monetary policy)\b/i,
    ],
    boosts: [/\b(naira|cbn|fintech|ngx|stock market)\b/i],
  },
  {
    category: 'Environment',
    weight: 3,
    patterns: [
      /\b(climate|flood|flooding|drought|pollution|deforestation|desertification|erosion)\b/i,
      /\b(environment(al)?|renewable|solar energy|emissions|wildlife|reforestation)\b/i,
      /\b(weather|rainfall|heatwave|oil spill|gas flaring|lagoon pollution)\b/i,
    ],
    boosts: [/\b(flood|oil spill|climate change|gas flaring)\b/i],
  },
  {
    category: 'Culture',
    weight: 3,
    patterns: [
      /\b(calabar carnival|cultural|heritage|tradition|festival|masquerade|owo|gele)\b/i,
      /\b(museum|gallery|literature|poetry|art exhibition|cultural day)\b/i,
      /\b(yoruba|igbo|hausa|efik|fulani|tiv)\b/i,
    ],
    boosts: [/\b(calabar carnival|heritage festival|masquerade)\b/i],
  },
  {
    category: 'Politics',
    weight: 2,
    patterns: [
      /\b(president|presidency|tinubu|shettima|governor|deputy governor|senate|senator)\b/i,
      /\b(house of reps|national assembly|election|inec|campaign|apc|pdp|labour party)\b/i,
      /\b(minister|ministry|cabinet|policy|politic(s|al)?|government|lawmaker)\b/i,
      /\b(impeach|constitution|court ruling|efcc|icpc|supreme court|federal executive)\b/i,
    ],
    boosts: [/\b(tinubu|inec|national assembly|senate passes|governor of)\b/i],
  },
];

function scoreCategory(haystack: string, rule: Rule): number {
  let hits = 0;
  for (const re of rule.patterns) {
    if (re.test(haystack)) hits += 1;
  }
  let score = hits * rule.weight;
  if (rule.boosts?.some((re) => re.test(haystack))) {
    score += 6;
  }
  return score;
}

/** Map free-text / provider category labels onto ARB News categories. */
export function inferCategory(
  text: string,
  providerCategory?: string | null,
): NewsCategory {
  const provider = (providerCategory ?? '').toLowerCase();
  const haystack = `${providerCategory ?? ''} ${text}`.toLowerCase();

  // Unambiguous provider labels
  if (/\bsport/i.test(provider)) return 'Sports';
  if (/entertain|celebrity|music|film|showbiz/i.test(provider)) {
    return 'Entertainment';
  }
  if (/business|technolog|finance|markets?/i.test(provider)) return 'Business';
  if (/health|science|climate|environment/i.test(provider)) return 'Environment';
  if (/culture|lifestyle|travel|arts/i.test(provider) && !/politic/i.test(provider)) {
    return 'Culture';
  }

  const scores = RULES.map((rule) => ({
    category: rule.category,
    score: scoreCategory(haystack, rule),
  })).sort((a, b) => b.score - a.score);

  const top = scores[0];
  const second = scores[1];

  // Prefer sports over politics when scores are close and sport signals exist
  if (
    top.category === 'Politics' &&
    second?.category === 'Sports' &&
    second.score > 0 &&
    top.score - second.score <= 4 &&
    /\b(super eagles|afcon|npfl|football|fixture|goal|matchday)\b/i.test(haystack)
  ) {
    return 'Sports';
  }

  // Prefer entertainment over politics for music/film heavy stories
  if (
    top.category === 'Politics' &&
    second?.category === 'Entertainment' &&
    second.score > 0 &&
    top.score - second.score <= 4 &&
    /\b(nollywood|afrobeats?|concert|album|movie|grammy)\b/i.test(haystack)
  ) {
    return 'Entertainment';
  }

  if (top.score <= 0) return 'Politics';
  return top.category;
}
