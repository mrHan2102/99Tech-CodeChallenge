import type { TokenQuote } from '../api/prices'
import { convertAmount, exchangeRate } from '../api/prices'
import {
  formatOutputAmount,
  parseAmount,
  validateAmount,
  type ParsedAmount,
} from './amount'

export type SwapQuoteDerived = {
  fromQ: TokenQuote | undefined
  toQ: TokenQuote | undefined
  amountParsed: ParsedAmount
  validation: string | null
  canConvert: boolean
  outputDisplay: string
  rateLine: string | null
  hintWhenInvalid: string | null
}

export function deriveSwapQuotePresentation(
  quotes: TokenQuote[] | undefined,
  fromCurrency: string,
  toCurrency: string,
  amountInRaw: string,
  touchedAmount: boolean,
): SwapQuoteDerived {
  const quoteMap = new Map(quotes?.map((q) => [q.currency, q]) ?? [])
  const fromQ = fromCurrency ? quoteMap.get(fromCurrency) : undefined
  const toQ = toCurrency ? quoteMap.get(toCurrency) : undefined

  const amountParsed = parseAmount(amountInRaw)
  const validation = validateAmount(amountInRaw, touchedAmount)

  const canConvert = Boolean(
    fromQ &&
      toQ &&
      fromQ.currency !== toQ.currency &&
      amountParsed.ok &&
      amountParsed.value > 0,
  )

  let outputDisplay = '—'
  let rateLine: string | null = null

  if (fromQ && toQ && fromQ.currency !== toQ.currency) {
    const rate = exchangeRate(fromQ, toQ)
    rateLine = `1 ${fromQ.currency} ≈ ${formatOutputAmount(rate)} ${toQ.currency}`

    if (amountParsed.ok && amountParsed.value > 0) {
      const out = convertAmount(amountParsed.value, fromQ, toQ)
      outputDisplay = formatOutputAmount(out)
    } else if (
      amountParsed.ok &&
      amountParsed.value === 0 &&
      touchedAmount &&
      amountInRaw.trim()
    ) {
      outputDisplay = formatOutputAmount(0)
    }
  }

  let hintWhenInvalid: string | null = null
  if (!canConvert && touchedAmount && fromQ && toQ) {
    hintWhenInvalid =
      fromQ.currency === toQ.currency
        ? 'From and To must be different tokens.'
        : 'Enter a positive amount to see a quote.'
  }

  return {
    fromQ,
    toQ,
    amountParsed,
    validation,
    canConvert,
    outputDisplay,
    rateLine,
    hintWhenInvalid,
  }
}
