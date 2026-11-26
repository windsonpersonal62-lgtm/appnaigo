import { Children, isValidElement, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Button as AxButton } from '@astryxdesign/core/Button'
import { Icon } from './Icon'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive'

type ButtonProps = {
  variant?: ButtonVariant
  size?: 'sm' | 'md' | 'lg'
  /** Ocupa a largura toda (formulários no celular). */
  fullWidth?: boolean
  children: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>

function textOf(node: ReactNode): string {
  return Children.toArray(node)
    .map((child) => (typeof child === 'string' || typeof child === 'number' ? String(child) : isValidElement<{ children?: ReactNode }>(child) && child.type !== Icon ? textOf(child.props.children) : ''))
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Botão do app sobre o `Button` do Astryx (Meta), no tema preto e prata.
 *
 * A API antiga continua (filhos com `<Icon>` + texto, `disabled`, `className`), então nenhuma tela
 * mudou: o primeiro `<Icon>` vira o ícone do Astryx e o resto vira o rótulo. `disabled` vira
 * `isDisabled`, que o Astryx implementa com aria-disabled (o botão continua focável).
 */
export function Button({ variant = 'primary', size = 'lg', fullWidth, children, disabled, type = 'button', className = '', onClick, ...rest }: ButtonProps) {
  const parts = Children.toArray(children)
  const iconEl = parts.find((child) => isValidElement(child) && child.type === Icon)
  const rest_ = parts.filter((child) => child !== iconEl)
  const label = textOf(rest_) || textOf(children) || (rest['aria-label'] ?? '')
  const onlyText = rest_.every((child) => typeof child === 'string' || typeof child === 'number')
  return (
    <AxButton
      {...(rest as Record<string, unknown>)}
      label={label}
      variant={variant}
      size={size}
      type={type}
      isDisabled={disabled}
      icon={iconEl}
      width={fullWidth ? '100%' : undefined}
      className={className}
      onClick={onClick as never}
    >
      {onlyText ? undefined : rest_}
    </AxButton>
  )
}
