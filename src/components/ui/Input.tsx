import { useId, type ChangeEvent, type InputHTMLAttributes } from 'react'
import { TextInput } from '@astryxdesign/core/TextInput'

type InputProps = {
  label: string
  error?: string
  hint?: string
} & InputHTMLAttributes<HTMLInputElement>

const ASTRYX_TYPES = new Set(['text', 'password', 'email', 'search', 'tel', 'url'])

/**
 * Campo de texto. Para os tipos que o Astryx cobre (texto, senha, e-mail, busca, telefone, URL) usa
 * o `TextInput` dele; data, hora e número seguem nativos (teclado/seletor do próprio celular), com o
 * mesmo visual.
 */
export function Input({ label, error, hint, id, className = '', type = 'text', ...rest }: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  if (ASTRYX_TYPES.has(type) && (rest.value !== undefined || rest.onChange)) {
    const { value, onChange, required, disabled, placeholder, readOnly, autoComplete, name, maxLength, minLength, onBlur, onKeyDown, autoFocus, inputMode, pattern } = rest
    return (
      <div className={`min-w-0 ${className}`}>
        <TextInput
          id={inputId}
          type={type as 'text'}
          label={label}
          value={String(value ?? '')}
          onChange={(_v: string, e: ChangeEvent<HTMLInputElement>) => onChange?.(e)}
          description={hint && !error ? hint : undefined}
          status={error ? { type: 'error', message: error } : undefined}
          isRequired={required}
          isDisabled={disabled}
          isReadOnly={readOnly}
          placeholder={placeholder}
          size="lg"
          {...({ autoComplete, name, maxLength, minLength, onBlur, onKeyDown, autoFocus, inputMode, pattern } as Record<string, unknown>)}
        />
      </div>
    )
  }

  const hintId = hint ? `${inputId}-hint` : undefined
  const errorId = error ? `${inputId}-error` : undefined
  // `min-w-0` permite que o campo encolha quando é item de grid/flex — ver NumberInput.tsx.
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-semibold text-text-primary">
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        aria-invalid={Boolean(error)}
        aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
        className={`h-11 w-full rounded-full border bg-surface px-4 font-body text-text-primary transition-colors focus:border-action-primary focus:outline-none focus:ring-2 focus:ring-action-primary/25 ${error ? 'border-error' : 'border-border'} ${className}`}
        {...rest}
      />
      {hint && !error && (
        <p id={hintId} className="text-xs text-text-secondary">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-error">
          {error}
        </p>
      )}
    </div>
  )
}
