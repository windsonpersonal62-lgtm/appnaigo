import { RouterProvider } from 'react-router-dom'
import { IntroGate } from './components/motion/IntroGate'
import { RoleProvider } from './app/providers/RoleProvider'
import { router } from './app/router/router'
import { AstryxProvider } from './app/providers/AstryxProvider'

export function App() {
  return (
    <AstryxProvider>
      <IntroGate>
        <RoleProvider>
          <RouterProvider router={router} />
        </RoleProvider>
      </IntroGate>
    </AstryxProvider>
  )
}
