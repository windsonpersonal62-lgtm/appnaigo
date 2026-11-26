import type { ReactNode } from 'react'
import { EmptyState as AxEmptyState } from '@astryxdesign/core/EmptyState'
import { Icon } from '../ui/Icon'

type EmptyStateProps = {
  icon?: string
  title: string
  description?: string
  action?: ReactNode
}

/** Estado vazio sobre o `EmptyState` do Astryx, dentro de um cartão tracejado. */
export function EmptyState({ icon = 'inbox', title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-border/80 bg-surface/40 p-6">
      <AxEmptyState
        title={title}
        description={description}
        icon={<Icon name={icon} className="text-[40px] text-text-secondary" />}
        actions={action}
      />
    </div>
  )
}
