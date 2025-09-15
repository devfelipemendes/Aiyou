// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports

import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Component Imports
import { Menu, MenuItem, MenuSection } from '@menu/vertical-menu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

type RenderExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

type Props = {
  scrollMenu: (container: any, isPerfectScrollbar: boolean) => void
}

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ scrollMenu }: Props) => {
  // Hooks
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()

  // Vars
  const { isBreakpointReached, transitionDuration } = verticalNavOptions

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  return (
    // eslint-disable-next-line lines-around-comment
    /* Custom scrollbar instead of browser scroll, remove if you want browser scroll only */
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: container => scrollMenu(container, false)
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
    >
      <Menu
        popoutMenuOffset={{ mainAxis: 10 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-line' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        <MenuItem href='/painel' icon={<i className='ri-dashboard-horizontal-line' />}>
          Painel
        </MenuItem>
        <MenuSection label={'Principais'}>
          <MenuItem href='/historico_interacoes' icon={<i className='ri-file-edit-line' />}>
            Histórico de interações
          </MenuItem>
          <MenuItem href='/assistentes' icon={<i className='ri-robot-3-line' />}>
            Assistentes
          </MenuItem>
          <MenuItem href='/projetos' icon={<i className='ri-folder-6-line' />}>
            Tab Inicio
          </MenuItem>
          <MenuItem href='/projetoss' icon={<i className='ri-folder-6-line' />}>
            Projetos
          </MenuItem>
          <MenuItem href='/monitoramento' icon={<i className='ri-bar-chart-line' />}>
            Monitoramento
          </MenuItem>
          <MenuItem href='/operadores/' icon={<i className='ri-customer-service-2-fill' />}>
            Operadores
          </MenuItem>
        </MenuSection>
        <MenuSection label={'Utilidades'}>
          <MenuItem href='/painel' icon={<i className='ri-tools-fill' />}>
            Ingtegração API
          </MenuItem>
        </MenuSection>

        <MenuSection label={'Gerenciamento'}>
          <MenuItem href='/financeiro' icon={<i className='ri-money-dollar-circle-line' />}>
            Financeiro
          </MenuItem>
        </MenuSection>
        <MenuSection label={'Utilidades'}>
          <MenuItem href='/painel' icon={<i className='ri-tools-fill' />}>
            Ingtegração API
          </MenuItem>
        </MenuSection>
        <MenuSection label={'Gerenciamento'}>
          <MenuItem href='/financeiro' icon={<i className='ri-money-dollar-circle-line' />}>
            Financeiro
          </MenuItem>
        </MenuSection>
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
