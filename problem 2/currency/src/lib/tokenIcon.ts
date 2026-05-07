/** Switcheo token-icons raw SVG base (symbol must match repo filename where possible). */
export function tokenIconUrl(currency: string): string {
  const safe = encodeURIComponent(currency.trim())
  return `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${safe}.svg`
}
