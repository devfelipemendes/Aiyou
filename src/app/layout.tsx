// app/layout.tsx - VERSÃO COMPLETA CORRIGIDA
// MUI Imports
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript'
import 'react-credit-cards-2/dist/es/styles-compiled.css'

// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'
import { ToastContainer } from 'react-toastify'

// Type Imports
import type { ChildrenType } from '@core/types'

// Util Imports
import { getSystemMode } from '@core/utils/serverHelpers'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'
import ReduxProvider from '@/redux-store/ReduxProvider'

export const metadata = {
  title: 'Aiyou',
  description: 'Sistema de inteligencia artificial',
  icons: {
    icon: '/favicon.svg'
  }
}

const RootLayout = async (props: ChildrenType) => {
  const { children } = props

  // Vars
  const systemMode = await getSystemMode()
  const direction = 'ltr'

  return (
    <html id='__next' lang='en' dir={direction} suppressHydrationWarning>
      <body className='flex is-full min-bs-full flex-auto flex-col'>
        <InitColorSchemeScript attribute='data' defaultMode={systemMode} />

        <ReduxProvider>{children}</ReduxProvider>

        <ToastContainer />
      </body>
    </html>
  )
}

export default RootLayout
