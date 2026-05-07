export const MAX_AMOUNT_DECIMALS = 12

export function sanitizeDecimalInput(raw: string): string {
  let s = raw.replace(/,/g, '.').replace(/[^\d.]/g, '')
  const firstDot = s.indexOf('.')
  if (firstDot !== -1) {
    const before = s.slice(0, firstDot + 1)
    const after = s.slice(firstDot + 1).replace(/\./g, '')
    s = before + after
  }
  if (s.startsWith('.')) s = `0${s}`
  return s
}

export function decimalsOf(raw: string): number {
  const i = raw.indexOf('.')
  if (i === -1) return 0
  return raw.length - i - 1
}

type ParseFail = { ok: false }
type ParseOk = { ok: true; value: number }
export type ParsedAmount = ParseFail | ParseOk

export function parseAmount(raw: string): ParsedAmount {
  const t = raw.trim()
  if (t === '' || t === '.') return { ok: false }
  const n = Number(t)
  if (!Number.isFinite(n)) return { ok: false }
  return { ok: true, value: n }
}

export function validateAmount(raw: string, touched: boolean): string | null {
  if (!touched) return null
  const t = raw.trim()
  if (t === '') return 'Enter an amount to swap.'
  const n = Number(t.replace(/,/g, '.'))
  if (!Number.isFinite(n)) return 'Enter a valid number.'
  if (n < 0) return 'Amount cannot be negative.'
  if (n === 0) return 'Amount must be greater than 0.'
  const dec = decimalsOf(sanitizeDecimalInput(raw.replace(/,/g, '.')))
  if (dec > MAX_AMOUNT_DECIMALS) {
    return `Maximum ${MAX_AMOUNT_DECIMALS} decimals allowed.`
  }
  return null
}

export function formatOutputAmount(n: number): string {
  if (!Number.isFinite(n)) return '—'
  const abs = Math.abs(n)
  const digits =
    abs === 0
      ? 2
      : abs >= 1
        ? 6
        : abs >= 0.000_001
          ? 8
          : 12
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: digits,
    useGrouping: abs >= 10_000 ? true : n !== 0 && abs < 0.001 ? false : true,
  }).format(n)
}
