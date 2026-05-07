import { useState } from 'react'
import { tokenIconUrl } from '../lib/tokenIcon'

type Props = {
  currency: string
  size?: number
  className?: string
}

export function TokenAvatar({ currency, size = 28, className }: Props) {
  const [failed, setFailed] = useState(false)

  const initial = currency.slice(0, 2).toUpperCase()

  if (failed) {
    return (
      <span
        className={className ? `token-avatar-fallback ${className}` : 'token-avatar-fallback'}
        style={{ width: size, height: size, fontSize: Math.max(10, size * 0.32) }}
      >
        {initial}
      </span>
    )
  }

  return (
    <img
      className={className}
      src={tokenIconUrl(currency)}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  )
}
