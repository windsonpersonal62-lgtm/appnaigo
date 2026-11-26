import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { LinkProvider } from '@astryxdesign/core/Link'
import { Theme } from '@astryxdesign/core/theme'
import { InternationalizationProvider } from '@astryxdesign/core/i18n'
import ptBR from '@astryxdesign/core/locales/pt-BR.generated.js'
import { defaultThemeSlug, themes } from '@/astryx-themes'

/** Links do Astryx (`href`) navegam pelo react-router, sem recarregar a página. */
const RouterAnchor = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement>>(
  function RouterAnchor({ href = '', ...rest }, ref) {
    if (/^(https?:|mailto:|tel:)/.test(href)) return <a ref={ref} href={href} {...rest} />
    return <RouterLink ref={ref} to={href} {...rest} />
  },
)

/** Textos internos do Astryx em português ("Obrigatório", "Carregando"…). Tema preto e prata do Windson (dark-only) para todos os componentes Astryx. */
export function AstryxProvider({ children }: { children: ReactNode }) {
  return (
    <InternationalizationProvider locale="pt-BR" messages={{ 'pt-BR': ptBR }}>
      <Theme theme={themes[defaultThemeSlug]} mode="dark">
        <LinkProvider component={RouterAnchor}>{children}</LinkProvider>
      </Theme>
    </InternationalizationProvider>
  )
}
