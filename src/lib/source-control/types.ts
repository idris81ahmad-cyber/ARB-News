import type { NewsCategory } from '@/types/article';

export type NewsProviderPref = 'auto' | 'newsapi' | 'gnews' | 'rss';

export interface SourceControlConfig {
  /** Substrings matched against source name or URL (case-insensitive). */
  blockedSources: string[];
  /**
   * If non-empty, only sources matching at least one entry are kept
   * (after blocklist is applied).
   */
  allowedSources: string[];
  /** Drop articles below this Naija relevance score (0 = off). */
  minRelevanceScore: number;
  /** Categories hidden from the public feed. */
  disabledCategories: NewsCategory[];
  /** Cap articles after filtering (0 = no cap). */
  maxArticles: number;
  /** Prefer only tier-1 Nigerian outlets when possible. */
  preferTier1Only: boolean;
  /** Preferred live provider (overrides NEWS_PROVIDER when set via admin). */
  preferredProvider: NewsProviderPref | null;
  updatedAt: string | null;
}

export const DEFAULT_SOURCE_CONTROL: SourceControlConfig = {
  blockedSources: [],
  allowedSources: [],
  minRelevanceScore: 0,
  disabledCategories: [],
  maxArticles: 40,
  preferTier1Only: false,
  preferredProvider: null,
  updatedAt: null,
};

export function normalizeSourceControl(
  input: Partial<SourceControlConfig> | null | undefined,
): SourceControlConfig {
  const base = { ...DEFAULT_SOURCE_CONTROL };
  if (!input || typeof input !== 'object') return base;

  return {
    blockedSources: Array.isArray(input.blockedSources)
      ? input.blockedSources.map((s) => String(s).trim().toLowerCase()).filter(Boolean)
      : base.blockedSources,
    allowedSources: Array.isArray(input.allowedSources)
      ? input.allowedSources.map((s) => String(s).trim().toLowerCase()).filter(Boolean)
      : base.allowedSources,
    minRelevanceScore:
      typeof input.minRelevanceScore === 'number' && input.minRelevanceScore >= 0
        ? Math.min(50, Math.floor(input.minRelevanceScore))
        : base.minRelevanceScore,
    disabledCategories: Array.isArray(input.disabledCategories)
      ? (input.disabledCategories.filter(Boolean) as NewsCategory[])
      : base.disabledCategories,
    maxArticles:
      typeof input.maxArticles === 'number' && input.maxArticles >= 0
        ? Math.min(100, Math.floor(input.maxArticles))
        : base.maxArticles,
    preferTier1Only: Boolean(input.preferTier1Only),
    preferredProvider:
      input.preferredProvider === 'auto' ||
      input.preferredProvider === 'newsapi' ||
      input.preferredProvider === 'gnews' ||
      input.preferredProvider === 'rss'
        ? input.preferredProvider
        : input.preferredProvider === null
          ? null
          : base.preferredProvider,
    updatedAt:
      typeof input.updatedAt === 'string' || input.updatedAt === null
        ? input.updatedAt
        : base.updatedAt,
  };
}
