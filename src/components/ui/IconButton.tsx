import type { ButtonHTMLAttributes } from 'react'
import { IconButton as AxIconButton } from '@astryxdesign/core/IconButton'
import { Icon } from './Icon'

type IconButtonProps = {
  icon: string
  label: string
  filled?: boolean
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
} & ButtonHTMLAttributes<HTMLButtonElement>

/** Botão só de ícone, sobre o `IconButton` do Astryx (rótulo vira aria-label e tooltip). */
export function IconButton({ icon, label, filled, variant = 'ghost', className = '', type = 'button', disabled, onClick, ...rest }: IconButtonProps) {
  return (
    <AxIconButton
      {...(rest as Record<string, unknown>)}
      label={label}
      tooltip={label}
      variant={variant}
      type={type}
      isDisabled={disabled}
      className={className}
      onClick={onClick as never}
      icon={<Icon name={icon} filled={filled} className="text-[20px]" />}
    />
  )
}
