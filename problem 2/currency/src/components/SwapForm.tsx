import { useMemo } from 'react'
import { useTokenQuotes } from '../hooks/useTokenQuotes'
import { quoteListFingerprint } from '../swap/pairDefaults'
import { SwapWorkbench } from './SwapWorkbench'

export function SwapForm() {
  const { quotes, loading, loadError, reload } = useTokenQuotes()

  const benchKey = useMemo(
    () => (quotes?.length ? quoteListFingerprint(quotes) : ''),
    [quotes],
  )

  if (loading && !quotes) {
    return (
      <div className="swap-shell">
        <div className="swap-card skeleton">
          <div className="sk-line sk-title" />
          <div className="sk-line sk-field" />
          <div className="sk-line sk-field" />
          <div className="sk-line sk-actions" />
        </div>
      </div>
    )
  }

  if (loadError || !quotes?.length) {
    return (
      <div className="swap-shell">
        <div className="swap-card swap-error-card" role="alert">
          <h2>Could not load data</h2>
          <p>{loadError ?? 'The token list is empty.'}</p>
          <button type="button" className="swap-btn-primary" onClick={() => void reload()}>
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (quotes.length < 2) {
    return (
      <div className="swap-shell">
        <header className="swap-hero">
          <p className="swap-badge">Swap assets</p>
          <h1>USD-based rates</h1>
        </header>
        <div className="swap-card swap-error-card" role="status">
          <h2>Not enough tokens to swap</h2>
          <p>
            Only {quotes.length} quoted token{(quotes.length === 1 ? ' is' : 's are')}{' '}
            available. At least two different tokens with prices are needed to swap.
          </p>
          <button type="button" className="swap-btn-primary" onClick={() => void reload()}>
            Reload
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="swap-shell">
      <SwapWorkbench key={benchKey} quotes={quotes} />
    </div>
  )
}
