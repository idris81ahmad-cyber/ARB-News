import { describe, expect, it } from 'vitest';
import { mapRssItem } from '@/lib/news/rss';

const SAMPLE_ITEM = `
<item>
  <title><![CDATA[CBN announces new naira policy in Abuja]]></title>
  <link>https://punchng.com/cbn-announces-new-naira-policy/</link>
  <pubDate>Mon, 28 Jul 2026 10:00:00 GMT</pubDate>
  <description><![CDATA[<p>The Central Bank of Nigeria outlined fresh measures to stabilise the currency.</p>]]></description>
  <enclosure url="https://cdn.example.com/naira.jpg" type="image/jpeg" />
</item>
`;

describe('mapRssItem', () => {
  it('maps a basic RSS item to Article', () => {
    const article = mapRssItem(SAMPLE_ITEM, 'Punch');
    expect(article).not.toBeNull();
    expect(article?.title).toContain('CBN');
    expect(article?.source).toBe('Punch');
    expect(article?.url).toContain('punchng.com');
    expect(article?.date).toBe('2026-07-28');
    expect(article?.imageUrl).toContain('naira.jpg');
  });

  it('returns null without title or link', () => {
    expect(mapRssItem('<item><title></title></item>', 'Punch')).toBeNull();
  });
});
