import { useCallback, useState } from 'react'
import {
  MAX_AMOUNT_DECIMALS,
  decimalsOf,
  sanitizeDecimalInput,
} from '../swap/amount'

type Args = {
  maxDecimals?: number
}

/** Controlled raw amount string with decimal sanitisation + blur touch gate for validation */
export function useSwapAmountInput({ maxDecimals = MAX_AMOUNT_DECIMALS }: Args = {}) {
  const [amountInRaw, setAmountInRaw] = useState('')
  const [touchedAmount, setTouchedAmount] = useState(false)

  const applyRawFromUser = useCallback(
    (raw: string) => {
      const next = sanitizeDecimalInput(raw)
      if (decimalsOf(next) <= maxDecimals) setAmountInRaw(next)
    },
    [maxDecimals],
  )

  const markAmountTouched = useCallback(() => setTouchedAmount(true), [])

  return {
    amountInRaw,
    touchedAmount,
    applyRawFromUser,
    markAmountTouched,
  }
}
