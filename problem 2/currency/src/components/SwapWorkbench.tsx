import { useCallback, useState } from 'react'
import type { TokenQuote } from '../api/prices'
import { useSwapAmountInput } from '../hooks/useSwapAmountInput'
import { useSwapQuoteDerived } from '../hooks/useSwapQuoteDerived'
import { defaultSwapPair } from '../swap/pairDefaults'
import { TokenPicker } from './TokenPicker'

type Props = {
  quotes: TokenQuote[]
}

export function SwapWorkbench({ quotes }: Props) {
  const { from: initialFrom, to: initialTo } = defaultSwapPair(quotes)
  const [fromCurrency, setFromCurrency] = useState(initialFrom)
  const [toCurrency, setToCurrency] = useState(initialTo)

  const { amountInRaw, touchedAmount, applyRawFromUser, markAmountTouched } =
    useSwapAmountInput()

  const d = useSwapQuoteDerived(
    quotes,
    fromCurrency,
    toCurrency,
    amountInRaw,
    touchedAmount,
  )

  const swapDirection = useCallback(() => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }, [fromCurrency, toCurrency])

  const flipDisabled =
    !fromCurrency || !toCurrency || fromCurrency === toCurrency

  return (
    <>
      <header className="swap-hero">
        <p className="swap-badge">Swap assets</p>
        <h1>USD-based rates</h1>
        <p className="swap-sub">
          Pick two priced tokens and enter an amount — conversion follows{' '}
          <span className="swap-mono">prices.json</span>.
        </p>
      </header>

      <section className="swap-card">
        <div className="swap-rows">
          <div className="swap-row-card">
            <div className="swap-row-main">
              <TokenPicker
                label="From"
                tokens={quotes}
                excludedCurrency={toCurrency || null}
                value={fromCurrency}
                onChange={setFromCurrency}
              />
              <label className="amount-field">
                <span className="amount-label">Amount</span>
                <input
                  id="amount-in"
                  className={`amount-input${d.validation ? ' has-error' : ''}`}
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="0.0"
                  value={amountInRaw}
                  onBlur={markAmountTouched}
                  onChange={(e) => applyRawFromUser(e.target.value)}
                />
              </label>
            </div>
            {d.validation ? (
              <p id="amount-err" className="field-error" role="status">
                {d.validation}
              </p>
            ) : null}
          </div>

          <div className="swap-middle">
            <button
              type="button"
              className="swap-flip"
              disabled={flipDisabled}
              onClick={swapDirection}
            >
              <span>⇅</span>
            </button>
          </div>

          <div className="swap-row-card">
            <div className="swap-row-main">
              <TokenPicker
                label="To"
                tokens={quotes}
                excludedCurrency={fromCurrency || null}
                value={toCurrency}
                onChange={setToCurrency}
              />
              <div className="amount-readout">
                <span className="amount-label">You receive (estimate)</span>
                <output
                  className={`amount-output${d.canConvert ? '' : ' is-dim'}`}
                  htmlFor="amount-in"
                >
                  {d.outputDisplay}{' '}
                  {d.toQ ? (
                    <span className="amount-output-ccy">{d.toQ.currency}</span>
                  ) : null}
                </output>
              </div>
            </div>
            {d.rateLine ? (
              <p className="rate-chip">
                {d.rateLine}
              </p>
            ) : null}
          </div>
        </div>

        {d.hintWhenInvalid ? (
          <p className="swap-hint swap-hint-below-rows" role="note">
            {d.hintWhenInvalid}
          </p>
        ) : null}
      </section>
    </>
  )
}
