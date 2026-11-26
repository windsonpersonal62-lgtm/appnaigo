import { ProgressBar as AxProgressBar } from '@astryxdesign/core/ProgressBar'

type ProgressBarProps = {
  value: number
  label?: string
  className?: string
}

export function ProgressBar({ value, label = 'Progresso', className = '' }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))
  return <AxProgressBar label={label} isLabelHidden value={clamped} className={className} />
}
