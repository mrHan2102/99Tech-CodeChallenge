import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import type { TokenQuote } from '../api/prices'
import { TokenAvatar } from './TokenAvatar'

type Props = {
  label: string
  tokens: TokenQuote[]
  excludedCurrency: string | null
  value: string
  onChange: (currency: string) => void
  disabled?: boolean
}

export function TokenPicker({
  label,
  tokens,
  excludedCurrency,
  value,
  onChange,
  disabled,
}: Props) {
  const listId = useId()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const wrapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const options = useMemo(() => {
    const q = query.trim().toLowerCase()
    return tokens.filter((item) => {
      if (excludedCurrency && item.currency === excludedCurrency) return false
      if (!q) return true
      return item.currency.toLowerCase().includes(q)
    })
  }, [tokens, excludedCurrency, query])

  const selected = tokens.find((item) => item.currency === value)

  const closePanel = useCallback(() => {
    setOpen(false)
    setQuery('')
  }, [])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) closePanel()
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open, closePanel])

  useEffect(() => {
    if (!open) return
    const id = window.requestAnimationFrame(() => inputRef.current?.focus())
    return () => window.cancelAnimationFrame(id)
  }, [open])

  return (
    <div className={`token-picker${disabled ? ' is-disabled' : ''}`} ref={wrapRef}>
      <span className="token-picker-label">{label}</span>
      <button
        type="button"
        className="token-picker-trigger"
        disabled={disabled}
        onClick={() => {
          if (disabled) return
          if (open) closePanel()
          else setOpen(true)
        }}
      >
        {selected ? (
          <>
            <TokenAvatar currency={selected.currency} size={30} />
            <span className="token-picker-code">{selected.currency}</span>
            <span className="token-picker-chevron">
              ▾
            </span>
          </>
        ) : (
          <span className="token-picker-placeholder">Choose token</span>
        )}
      </button>

      {open && (
        <div className="token-picker-panel" role="presentation">
          <input
            ref={inputRef}
            id={listId}
            type="search"
            className="token-picker-search"
            placeholder="Search by symbol…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
          <ul className="token-picker-list" role="listbox">
            {options.length === 0 ? (
              <li className="token-picker-empty">No results</li>
            ) : (
              options.map((item) => (
                <li key={item.currency} role="none">
                  <button
                    type="button"
                    role="option"
                    className={`token-picker-option${item.currency === value ? ' is-selected' : ''}`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onChange(item.currency)
                      closePanel()
                    }}
                  >
                    <TokenAvatar currency={item.currency} size={26} />
                    <span className="token-picker-option-code" title={item.currency}>
                      {item.currency}
                    </span>
                    <span className="token-picker-option-meta">
                      ${formatUsd(item.priceUsd)}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

function formatUsd(n: number): string {
  return new Intl.NumberFormat(undefined, {
    notation: n >= 1e6 ? 'compact' : 'standard',
    maximumFractionDigits: n >= 1 ? 3 : n >= 0.001 ? 5 : 8,
    minimumFractionDigits: 0,
  }).format(n)
}
