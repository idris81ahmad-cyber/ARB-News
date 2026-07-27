'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { SourceControlConfig } from '@/lib/source-control/types';
import { CATEGORIES, type NewsCategory } from '@/types/article';

interface FeedStats {
  provider: string;
  count: number;
  droppedByControl: number;
  sourceStats: { name: string; count: number; blocked: boolean }[];
}

interface AdminDashboardProps {
  configured: boolean;
}

const emptyConfig: SourceControlConfig = {
  blockedSources: [],
  allowedSources: [],
  minRelevanceScore: 0,
  disabledCategories: [],
  maxArticles: 40,
  preferTier1Only: false,
  preferredProvider: null,
  updatedAt: null,
};

export function AdminDashboard({ configured }: AdminDashboardProps) {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<SourceControlConfig>(emptyConfig);
  const [envExport, setEnvExport] = useState('');
  const [feed, setFeed] = useState<FeedStats | null>(null);
  const [blockedText, setBlockedText] = useState('');
  const [allowedText, setAllowedText] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/source-control', { cache: 'no-store' });
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setAuthed(true);
      setConfig(data.config);
      setEnvExport(data.envExport || '');
      setFeed(data.feed || null);
      setBlockedText((data.config.blockedSources || []).join('\n'));
      setAllowedText((data.config.allowedSources || []).join('\n'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (configured) void load();
  }, [configured, load]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      setPassword('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' });
    setAuthed(false);
    setFeed(null);
  };

  const save = async () => {
    setLoading(true);
    setError(null);
    setStatus(null);
    try {
      const body: Partial<SourceControlConfig> = {
        ...config,
        blockedSources: blockedText
          .split(/[\n,]+/)
          .map((s) => s.trim())
          .filter(Boolean),
        allowedSources: allowedText
          .split(/[\n,]+/)
          .map((s) => s.trim())
          .filter(Boolean),
      };
      const res = await fetch('/api/admin/source-control', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setConfig(data.config);
      setEnvExport(data.envExport || '');
      setFeed(data.feed || null);
      setStatus(data.note || 'Saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  const reset = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/source-control', { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');
      setConfig(data.config);
      setEnvExport(data.envExport || '');
      setBlockedText((data.config.blockedSources || []).join('\n'));
      setAllowedText((data.config.allowedSources || []).join('\n'));
      setStatus(data.note || 'Reset.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (cat: NewsCategory) => {
    setConfig((c) => {
      const has = c.disabledCategories.includes(cat);
      return {
        ...c,
        disabledCategories: has
          ? c.disabledCategories.filter((x) => x !== cat)
          : [...c.disabledCategories, cat],
      };
    });
  };

  const toggleBlockSource = (name: string) => {
    const key = name.toLowerCase();
    const lines = blockedText
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const has = lines.some((l) => l.toLowerCase() === key || key.includes(l));
    if (has) {
      setBlockedText(
        lines.filter((l) => l.toLowerCase() !== key && !key.includes(l)).join('\n'),
      );
    } else {
      setBlockedText([...lines, name].join('\n'));
    }
  };

  const categoryOptions = useMemo(
    () => CATEGORIES.filter((c): c is NewsCategory => c !== 'All'),
    [],
  );

  if (!configured) {
    return (
      <div className="space-y-4 rounded-xl border border-border bg-card p-6">
        <h1 className="text-2xl font-bold text-naija-green">Source control</h1>
        <p className="text-muted-foreground">
          Admin is not configured. Add an environment variable and redeploy:
        </p>
        <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-sm">
          ADMIN_SECRET=your-long-password-here
        </pre>
        <p className="text-sm text-muted-foreground">
          Optional durable config (JSON): <code>SOURCE_CONTROL_JSON</code>
        </p>
        <Button asChild variant="outline">
          <Link href="/">← Back to feed</Link>
        </Button>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="mx-auto max-w-md space-y-4 rounded-xl border border-border bg-card p-6">
        <h1 className="text-2xl font-bold text-naija-green">Admin login</h1>
        <p className="text-sm text-muted-foreground">
          Manage source allow/block lists and feed quality controls.
        </p>
        <form onSubmit={(e) => void login(e)} className="space-y-3">
          <label className="block text-sm font-medium" htmlFor="admin-pass">
            Password
          </label>
          <Input
            id="admin-pass"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
        <Button asChild variant="ghost" className="w-full">
          <Link href="/">← Back to feed</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-naija-green">Source control</h1>
          <p className="text-sm text-muted-foreground">
            Filter outlets, categories, and quality before the public feed.
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => void load()} disabled={loading}>
            Refresh
          </Button>
          <Button type="button" variant="ghost" onClick={() => void logout()}>
            Log out
          </Button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}
      {status && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900" role="status">
          {status}
        </p>
      )}

      {feed && (
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="font-semibold">Live feed snapshot</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Provider: <strong>{feed.provider}</strong> · Showing{' '}
            <strong>{feed.count}</strong>
            {feed.droppedByControl > 0
              ? ` · Dropped by control: ${feed.droppedByControl}`
              : ''}
          </p>
          <ul className="mt-3 max-h-56 space-y-1 overflow-y-auto text-sm">
            {feed.sourceStats.map((s) => (
              <li
                key={s.name}
                className="flex items-center justify-between gap-2 rounded-md border border-border/60 px-2 py-1.5"
              >
                <span>
                  {s.name}{' '}
                  <span className="text-muted-foreground">({s.count})</span>
                  {s.blocked && (
                    <span className="ml-2 text-xs font-semibold text-red-600">
                      blocked
                    </span>
                  )}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant={s.blocked ? 'outline' : 'destructive'}
                  onClick={() => toggleBlockSource(s.name)}
                >
                  {s.blocked ? 'Unblock' : 'Block'}
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="grid gap-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium" htmlFor="blocked">
            Blocked sources (one per line, substring match)
          </label>
          <textarea
            id="blocked"
            className="min-h-28 w-full rounded-md border border-border bg-background p-2 text-sm"
            value={blockedText}
            onChange={(e) => setBlockedText(e.target.value)}
            placeholder={'live science\nbbc'}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium" htmlFor="allowed">
            Allowed sources only (optional — empty = all non-blocked)
          </label>
          <textarea
            id="allowed"
            className="min-h-24 w-full rounded-md border border-border bg-background p-2 text-sm"
            value={allowedText}
            onChange={(e) => setAllowedText(e.target.value)}
            placeholder={'punch\npremium times\nchannels'}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="min-score">
            Min Naija relevance score ({config.minRelevanceScore})
          </label>
          <input
            id="min-score"
            type="range"
            min={0}
            max={20}
            value={config.minRelevanceScore}
            onChange={(e) =>
              setConfig((c) => ({
                ...c,
                minRelevanceScore: Number(e.target.value),
              }))
            }
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="max-articles">
            Max articles
          </label>
          <Input
            id="max-articles"
            type="number"
            min={0}
            max={100}
            value={config.maxArticles}
            onChange={(e) =>
              setConfig((c) => ({
                ...c,
                maxArticles: Number(e.target.value) || 0,
              }))
            }
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="provider">
            Preferred provider
          </label>
          <select
            id="provider"
            className="h-10 w-full rounded-md border border-border bg-background px-2 text-sm"
            value={config.preferredProvider ?? ''}
            onChange={(e) =>
              setConfig((c) => ({
                ...c,
                preferredProvider:
                  e.target.value === ''
                    ? null
                    : (e.target.value as SourceControlConfig['preferredProvider']),
              }))
            }
          >
            <option value="">Env default (NEWS_PROVIDER)</option>
            <option value="auto">auto</option>
            <option value="gnews">gnews</option>
            <option value="newsapi">newsapi</option>
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={config.preferTier1Only}
            onChange={(e) =>
              setConfig((c) => ({ ...c, preferTier1Only: e.target.checked }))
            }
          />
          Tier-1 outlets only (Punch, Premium Times, Channels, …)
        </label>

        <div className="space-y-2 sm:col-span-2">
          <p className="text-sm font-medium">Disabled categories</p>
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map((cat) => {
              const off = config.disabledCategories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    off
                      ? 'border-red-300 bg-red-50 text-red-800'
                      : 'border-border bg-background'
                  }`}
                >
                  {off ? `Hidden: ${cat}` : cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => void save()} disabled={loading}>
          Save controls
        </Button>
        <Button type="button" variant="outline" onClick={() => void reset()} disabled={loading}>
          Reset runtime overrides
        </Button>
        <Button asChild variant="ghost">
          <Link href="/">View public feed</Link>
        </Button>
      </div>

      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="font-semibold">Persist on Vercel (cold starts)</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Runtime saves apply immediately on warm instances. For durability, set
          this as <code>SOURCE_CONTROL_JSON</code>:
        </p>
        <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-muted p-3 text-xs">
          {envExport || '{}'}
        </pre>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mt-2"
          onClick={() => void navigator.clipboard?.writeText(envExport)}
        >
          Copy JSON
        </Button>
        {config.updatedAt && (
          <p className="mt-2 text-xs text-muted-foreground">
            Last runtime update: {new Date(config.updatedAt).toLocaleString()}
          </p>
        )}
      </section>
    </div>
  );
}
