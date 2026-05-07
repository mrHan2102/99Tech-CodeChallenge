import { useCallback, useEffect, useState } from 'react'
import { type TokenQuote, fetchTokenQuotes } from '../api/prices'

export type UseTokenQuotesResult = {
  quotes: TokenQuote[] | null
  loading: boolean
  loadError: string | null
  reload: () => Promise<void>
}

/** Loads normalized token quotes once on mount + offers manual reload */
export function useTokenQuotes(): UseTokenQuotesResult {
  const [quotes, setQuotes] = useState<TokenQuote[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const list = await fetchTokenQuotes()
      setQuotes(list)
    } catch (e) {
      setQuotes(null)
      setLoadError(
        e instanceof Error ? e.message : 'Unknown error while loading prices.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => {
      void reload()
    }, 0)
    return () => window.clearTimeout(t)
  }, [reload])

  return { quotes, loading, loadError, reload }
}
