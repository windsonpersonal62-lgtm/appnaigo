import { Spinner } from '@astryxdesign/core/Spinner'

type LoadingStateProps = {
  label?: string
}

export function LoadingState({ label = 'Carregando…' }: LoadingStateProps) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center gap-3 p-8 text-center">
      <Spinner size="xl" aria-label={label} />
      <p className="text-sm text-text-secondary">{label}</p>
    </div>
  )
}
