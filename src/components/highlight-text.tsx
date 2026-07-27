import { escapeRegExp } from '@/lib/article-helpers';

interface HighlightTextProps {
  text: string;
  query: string;
  className?: string;
}

/** Highlight case-insensitive matches of query tokens inside text. */
export function HighlightText({ text, query, className }: HighlightTextProps) {
  const q = query.trim();
  if (!q) {
    return <span className={className}>{text}</span>;
  }

  const tokens = q
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1);

  if (tokens.length === 0) {
    return <span className={className}>{text}</span>;
  }

  const pattern = new RegExp(`(${tokens.map(escapeRegExp).join('|')})`, 'ig');
  const parts = text.split(pattern);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        const isMatch = tokens.some(
          (t) => part.toLowerCase() === t.toLowerCase(),
        );
        if (isMatch) {
          return (
            <mark
              key={`${part}-${i}`}
              className="rounded-sm bg-naija-gold/70 px-0.5 text-neutral-900 dark:bg-naija-gold/50"
            >
              {part}
            </mark>
          );
        }
        return <span key={`${part}-${i}`}>{part}</span>;
      })}
    </span>
  );
}
