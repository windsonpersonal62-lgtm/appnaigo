import type { HTMLAttributes } from 'react'
import { Badge as AxBadge } from '@astryxdesign/core/Badge'

type BadgeTone = 'neutral' | 'success' | 'warning' | 'error' | 'informative'

type BadgeProps = {
  tone?: BadgeTone
} & HTMLAttributes<HTMLSpanElement>

const VARIANT = { neutral: 'neutral', success: 'success', warning: 'warning', error: 'error', informative: 'info' } as const

/** Selo de status sobre o `Badge` do Astryx. */
export function Badge({ tone = 'neutral', className = '', children, ...rest }: BadgeProps) {
  return <AxBadge {...(rest as Record<string, unknown>)} variant={VARIANT[tone]} label={children} className={className} />
}
