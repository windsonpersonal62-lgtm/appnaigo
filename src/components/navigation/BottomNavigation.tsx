import { NavLink } from 'react-router-dom'
import { Icon } from '../ui/Icon'
import { formatBadgeCount } from './navBadge'

export interface NavItem {
  to: string
  icon: string
  label: string
  /** Não lidas da aba. `0`/ausente não desenha nada — badge vazio é ruído. */
  badgeCount?: number
}

type BottomNavigationProps = {
  items: NavItem[]
}

export function BottomNavigation({ items }: BottomNavigationProps) {
  return (
    <nav
      aria-label="Navegação principal"
      className="glass-chrome fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 flex items-center justify-between gap-1 rounded-[1.75rem] p-1.5 shadow-glass-lg ring-1 ring-white/10 md:hidden"
    >
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to.endsWith('inicio') || item.to.endsWith('dashboard')}
          aria-label={
            item.badgeCount !== undefined && item.badgeCount > 0
              ? `${item.label}, ${item.badgeCount} não lidas`
              : undefined
          }
          className={({ isActive }) =>
            // Tab bar flutuante: só o item ativo mostra o rótulo, dentro de uma cápsula lima — com
            // 7 abas no aluno, rótulo em todas virava texto truncado de 40px.
            `flex h-12 min-w-0 items-center justify-center gap-1.5 rounded-full transition-[background-color,color,flex-grow] duration-300 ease-out-quint active:scale-95 ${
              isActive ? 'flex-[2.4] bg-action-primary px-3 text-action-primary-foreground' : 'flex-1 text-text-secondary'
            }`
          }
        >
          {({ isActive }) => (
            <>
              {/* O ponto marca o item ativo sem depender só de cor. */}
              <span className="relative">
                <Icon name={item.icon} filled={isActive} />
                {item.badgeCount !== undefined && item.badgeCount > 0 && (
                  <span
                    // O número também vai no aria-label do NavLink: quem usa leitor de tela não
                    // vê a bolinha.
                    aria-hidden="true"
                    className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 font-mono text-[10px] font-bold leading-none text-white"
                  >
                    {formatBadgeCount(item.badgeCount)}
                  </span>
                )}
              </span>
              <span className={isActive ? 'truncate text-[13px] font-semibold' : 'sr-only'}>{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
