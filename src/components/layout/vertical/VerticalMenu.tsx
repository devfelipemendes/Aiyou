// MUI Imports
import { useState } from 'react'

import { useTheme } from '@mui/material/styles'
import { Card, CardContent, Typography, Button, CircularProgress, Box, LinearProgress, Divider } from '@mui/material'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Component Imports
import { Menu, MenuItem, MenuSection } from '@menu/vertical-menu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'
import { useUserMe } from '@/hooks/useUserMe'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'
import { AnimatedReveal } from '@/components/AnimetedReveal'
import PricingPlansModal from '@/components/dialogs/plans'

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

// Componente do Card de Upgrade
const UpgradeCard = ({ OpenModalPlan }: { OpenModalPlan: () => void }) => {
  const { plan, userTokensUsage } = useUserMe()
  const theme = useTheme()

  // Valores mockados para demonstração - depois virão do useUserMe()
  const planName = plan?.name || 'Plano Free'
  const maxTokens = plan?.max_tokens || 100000 // Máximo de tokens do plano
  const usedTokens = parseInt(String(userTokensUsage ?? '0')) // Tokens utilizados
  const remainingTokens = maxTokens - usedTokens // Tokens restantes

  // Calcular porcentagem usada
  const usagePercentage = Math.min((usedTokens / maxTokens) * 100, 100)

  // Determinar cor baseada na porcentagem
  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'error'
    if (percentage >= 70) return 'warning'

    return 'primary'
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }

    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }

    return num.toString()
  }

  return (
    <Card
      sx={{
        margin: 2,

        borderRadius: 2
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header do Card */}
        <Box display='flex' alignItems='center' justifyContent='space-between' mb={2}>
          <Typography variant='h6' color='primary' fontWeight='bold'>
            {planName.toUpperCase()}
          </Typography>
          <Box position='relative' display='inline-flex'>
            <CircularProgress
              variant='determinate'
              value={usagePercentage}
              size={50}
              thickness={4}
              color={getProgressColor(usagePercentage)}
              sx={{
                circle: {
                  strokeLinecap: 'round'
                }
              }}
            />
            <Box
              position='absolute'
              top={0}
              left={0}
              bottom={0}
              right={0}
              display='flex'
              alignItems='center'
              justifyContent='center'
            >
              <Typography variant='caption' fontWeight='bold' color={`${getProgressColor(usagePercentage)}.main`}>
                {Math.round(usagePercentage)}%
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Progresso Linear */}
        <LinearProgress
          variant='determinate'
          value={usagePercentage}
          color={getProgressColor(usagePercentage)}
          sx={{
            height: 6,
            borderRadius: 3,
            mb: 2,
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
          }}
        />

        {/* Estatísticas de Uso */}
        <Box display='flex' flexDirection='column' gap={1} mb={2}>
          <Box display='flex' justifyContent='space-between' alignItems='center'>
            <Typography variant='body2' color='text.secondary'>
              Tokens utilizados:
            </Typography>
            <Typography variant='body2' fontWeight='medium'>
              {formatNumber(usedTokens)}
            </Typography>
          </Box>

          <Box display='flex' justifyContent='space-between' alignItems='center'>
            <Typography variant='body2' color='text.secondary'>
              Tokens restantes:
            </Typography>
            <Typography
              variant='body2'
              fontWeight='medium'
              color={remainingTokens < maxTokens * 0.1 ? 'error.main' : 'success.main'}
            >
              {formatNumber(remainingTokens)}
            </Typography>
          </Box>

          <Divider sx={{ my: 0.5 }} />

          <Box display='flex' justifyContent='space-between' alignItems='center'>
            <Typography variant='body2' color='text.secondary'>
              Total do plano:
            </Typography>
            <Typography variant='body2' fontWeight='bold' color='primary.main'>
              {formatNumber(maxTokens)}
            </Typography>
          </Box>
        </Box>

        {/* Botão de Upgrade */}
        <Button
          variant='contained'
          fullWidth
          size='small'
          color='primary'
          startIcon={<i className='ri-vip-crown-line' />}
          onClick={OpenModalPlan}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            py: 1
          }}
        >
          {usagePercentage >= 90 ? 'Upgrade Urgente!' : 'Fazer Upgrade'}
        </Button>

        {/* Aviso quando próximo do limite */}
        {usagePercentage >= 80 && (
          <Typography
            variant='caption'
            color={usagePercentage >= 90 ? 'error.main' : 'warning.main'}
            display='block'
            textAlign='center'
            mt={1}
            fontWeight='medium'
          >
            {usagePercentage >= 90 ? '⚠️ Limite quase atingido!' : '📊 Considerando um upgrade?'}
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}

const VerticalMenu = ({ scrollMenu }: Props) => {
  // Hooks
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const [modalOpen, setModalOpen] = useState(false)

  const handleOpenModal = () => {
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
  }

  // Vars
  const { isBreakpointReached, transitionDuration, isCollapsed, isHovered } = verticalNavOptions

  const isEffectivelyCollapsed = isCollapsed && !isHovered

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  // Detectar se o menu está colapsado - você pode ajustar essa lógica conforme seu sistema
  // Por exemplo, verificando se há uma prop ou estado que indica se está colapsado

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Menu com Scroll */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'hidden',
          minHeight: 0 // Importante para permitir que o flex shrink funcione
        }}
      >
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
          style={{ height: '100%' }}
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
                Integração API
              </MenuItem>
            </MenuSection>

            <MenuSection label={'Gerenciamento'}>
              <MenuItem href='/financeiro' icon={<i className='ri-money-dollar-circle-line' />}>
                Financeiro
              </MenuItem>
            </MenuSection>
          </Menu>
        </ScrollWrapper>
      </Box>

      {/* Card de Upgrade Fixo */}
      {!isEffectivelyCollapsed && (
        <AnimatedReveal animation='fade' duration={1200} show={true}>
          <Box
            sx={{
              flexShrink: 0
            }}
          >
            <UpgradeCard OpenModalPlan={handleOpenModal} />
          </Box>
        </AnimatedReveal>
      )}
      <PricingPlansModal open={modalOpen} onClose={handleCloseModal} />
    </Box>
  )
}

export default VerticalMenu
