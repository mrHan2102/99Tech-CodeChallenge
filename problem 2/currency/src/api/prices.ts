import axios from 'axios'

export const PRICES_URL = 'https://interview.switcheo.com/prices.json'

export type TokenQuote = {
  currency: string
  priceUsd: number
}

type RawPriceRow = {
  currency?: string
  date?: string
  price?: unknown
}

/** USD notionals per token; duplicate currencies keep the freshest `date`. */
export function normalizePriceRows(rows: RawPriceRow[]): TokenQuote[] {
  const latest = new Map<string, { priceUsd: number; at: Date }>()

  for (const row of rows) {
    if (typeof row.currency !== 'string' || row.currency.trim() === '') continue
    if (typeof row.price !== 'number' || !Number.isFinite(row.price) || row.price <= 0) {
      continue
    }
    if (typeof row.date !== 'string') continue
    const at = new Date(row.date)
    if (Number.isNaN(at.getTime())) continue

    const key = row.currency
    const prev = latest.get(key)
    if (!prev || at > prev.at) {
      latest.set(key, { priceUsd: row.price, at })
    }
  }

  return [...latest.entries()]
    .map(([currency, { priceUsd }]) => ({ currency, priceUsd }))
    .sort((a, b) => a.currency.localeCompare(b.currency, undefined, { sensitivity: 'base' }))
}

export async function fetchTokenQuotes(): Promise<TokenQuote[]> {
  try {
    const { data } = await axios.get<unknown>(PRICES_URL, {
      headers: { Accept: 'application/json' },
      timeout: 15_000,
    })

    if (!Array.isArray(data)) {
      throw new Error('Invalid prices payload shape.')
    }

    const quotes = normalizePriceRows(data as RawPriceRow[])
    if (quotes.length === 0) {
      throw new Error('No tokens with a valid price found.')
    }
    return quotes
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (err.response) {
        throw new Error(`Could not fetch prices (HTTP ${err.response.status}).`, {
          cause: err,
        })
      }
      if (err.code === 'ECONNABORTED') {
        throw new Error('Price request timed out.', { cause: err })
      }
      throw new Error('Could not reach price server (network error).', { cause: err })
    }
    throw err
  }
}

/** out = in × (usdPerIn / usdPerOut) */
export function convertAmount(amountIn: number, from: TokenQuote, to: TokenQuote): number {
  return amountIn * (from.priceUsd / to.priceUsd)
}

export function exchangeRate(from: TokenQuote, to: TokenQuote): number {
  return from.priceUsd / to.priceUsd
}
