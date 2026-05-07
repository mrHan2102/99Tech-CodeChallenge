import { useMemo } from 'react'
import type { TokenQuote } from '../api/prices'
import {
  deriveSwapQuotePresentation,
  type SwapQuoteDerived,
} from '../swap/deriveQuote'

/** Memoised USD cross-rate outputs for the swap form */
export function useSwapQuoteDerived(
  quotes: TokenQuote[] | null | undefined,
  fromCurrency: string,
  toCurrency: string,
  amountInRaw: string,
  touchedAmount: boolean,
): SwapQuoteDerived {
  return useMemo(
    () =>
      deriveSwapQuotePresentation(
        quotes ?? undefined,
        fromCurrency,
        toCurrency,
        amountInRaw,
        touchedAmount,
      ),
    [quotes, fromCurrency, toCurrency, amountInRaw, touchedAmount],
  )
}
