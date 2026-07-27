import {
  DEFAULT_SOURCE_CONTROL,
  normalizeSourceControl,
  type SourceControlConfig,
} from '@/lib/source-control/types';

declare global {
  var __arbSourceControl: SourceControlConfig | undefined;
}

function fromEnv(): Partial<SourceControlConfig> | null {
  const raw = process.env.SOURCE_CONTROL_JSON?.trim();
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Partial<SourceControlConfig>;
  } catch {
    console.error('[source-control] Invalid SOURCE_CONTROL_JSON');
    return null;
  }
}

/** Effective config: defaults ← env ← runtime (admin) overrides. */
export function getSourceControl(): SourceControlConfig {
  const envPart = fromEnv();
  const runtime = globalThis.__arbSourceControl;
  const merged = normalizeSourceControl({
    ...DEFAULT_SOURCE_CONTROL,
    ...(envPart ?? {}),
    ...(runtime ?? {}),
  });
  return merged;
}

export function setSourceControl(
  next: Partial<SourceControlConfig>,
): SourceControlConfig {
  const current = getSourceControl();
  const saved = normalizeSourceControl({
    ...current,
    ...next,
    updatedAt: new Date().toISOString(),
  });
  globalThis.__arbSourceControl = saved;
  return saved;
}

export function resetSourceControl(): SourceControlConfig {
  globalThis.__arbSourceControl = undefined;
  return getSourceControl();
}

export function exportSourceControlEnv(config: SourceControlConfig): string {
  return JSON.stringify({
    blockedSources: config.blockedSources,
    allowedSources: config.allowedSources,
    minRelevanceScore: config.minRelevanceScore,
    disabledCategories: config.disabledCategories,
    maxArticles: config.maxArticles,
    preferTier1Only: config.preferTier1Only,
    preferredProvider: config.preferredProvider,
  });
}
