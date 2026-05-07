import type { TokenQuote } from '../api/prices'

export function defaultSwapPair(quotes: TokenQuote[]): {
  from: string
  to: string
} {
  const primary = quotes[0]!.currency
  const secondary =
    quotes.find((t) => t.currency !== primary)?.currency ?? primary
  return { from: primary, to: secondary }
}

/** Fingerprint used as React `key`; currency set only — price updates reuse the same workbench mount */
export function quoteListFingerprint(quotes: TokenQuote[]): string {
  return quotes.map((q) => q.currency).join('|')
}
