// React Imports
import { useEffect, useState } from 'react'
import type { RefObject } from 'react'

// MUI Imports
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import CardContent from '@mui/material/CardContent'

// Type Imports
import { useColorScheme } from '@mui/material'

import type { AppDispatch } from '@/redux-store'
import type { ChatDataType, ContactType } from '@/types/chatTypes'

// Component Imports
import OptionMenu from '@core/components/option-menu'
import AvatarWithBadge from './AvatarWithBadge'
import { statusObj } from './SidebarLeft'
import ChatLog from './ChatLog'
import SendMsgForm from './SendMsgForm'
import UserProfileRight from './UserProfileRight'
import CustomAvatar from '@core/components/mui/Avatar'

import type { Mode } from '@core/types'

type Props = {
  chatStore: ChatDataType
  dispatch: AppDispatch
  backdropOpen: boolean
  setBackdropOpen: (open: boolean) => void
  setSidebarOpen: (open: boolean) => void
  isBelowMdScreen: boolean
  isBelowLgScreen: boolean
  isBelowSmScreen: boolean
  messageInputRef: RefObject<HTMLDivElement>
  mode: Mode
}

// Configuração do background - ALTERE AQUI
const BACKGROUND_CONFIG = {
  image: '/images/iaImages/bgChat.png', // Caminho para sua imagem
  opacity: 0.1, // Ajuste a opacity conforme necessário (0.05 - 0.2)
  enableBlur: false, // true para adicionar blur effect
  blurAmount: '5px'
}

// Renders the user avatar with badge and user information
const UserAvatar = ({
  activeUser,
  setUserProfileLeftOpen,
  setBackdropOpen
}: {
  activeUser: ContactType
  setUserProfileLeftOpen: (open: boolean) => void
  setBackdropOpen: (open: boolean) => void
}) => (
  <div
    className='flex items-center gap-4 cursor-pointer'
    onClick={() => {
      setUserProfileLeftOpen(true)
      setBackdropOpen(true)
    }}
  >
    <AvatarWithBadge
      alt={activeUser?.fullName}
      src={activeUser?.avatar}
      color={activeUser?.avatarColor}
      badgeColor={statusObj[activeUser?.status || 'offline']}
    />
    <div>
      <Typography color='white'>{activeUser?.fullName}</Typography>
      <Typography variant='body2' color='white'>
        {activeUser?.role}
      </Typography>
    </div>
  </div>
)

const ChatContent = (props: Props) => {
  const { mode } = props

  const { mode: muiMode, systemMode: muiSystemMode } = useColorScheme()

  const currentMode = muiMode === 'system' ? muiSystemMode : muiMode || mode

  const isDark = currentMode === 'dark'

  // Props
  const {
    chatStore,
    dispatch,
    backdropOpen,
    setBackdropOpen,
    setSidebarOpen,
    isBelowMdScreen,
    isBelowSmScreen,
    isBelowLgScreen,
    messageInputRef
  } = props

  const { activeUser } = chatStore

  // States
  const [userProfileRightOpen, setUserProfileRightOpen] = useState(false)

  // Close user profile right drawer if backdrop is closed and user profile right drawer is open
  useEffect(() => {
    if (!backdropOpen && userProfileRightOpen) {
      setUserProfileRightOpen(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backdropOpen])

  // Estilo para o background aplicado diretamente no container
  const backgroundStyle = {
    backgroundImage: `url(${BACKGROUND_CONFIG.image})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundBlendMode: 'overlay' as const,
    backgroundColor: isDark
      ? `rgb(0, 77, 97, ${1 - BACKGROUND_CONFIG.opacity})`
      : `rgb(2, 129, 117, ${1 - BACKGROUND_CONFIG.opacity})`,
    filter: BACKGROUND_CONFIG.enableBlur ? `blur(${BACKGROUND_CONFIG.blurAmount})` : 'none'
  }

  return !chatStore.activeUser ? (
    <CardContent
      className='flex flex-col flex-auto items-center justify-center bs-full gap-[18px]'
      style={backgroundStyle}
    >
      <CustomAvatar variant='circular' size={98} color='primary' skin='light'>
        <i className='ri-wechat-line text-[50px] text-zinc-50' />
      </CustomAvatar>
      <Typography className='text-center font-medium text-zinc-50' color='white'>
        Select a contact to start a conversation.
      </Typography>
      {isBelowMdScreen && (
        <Button
          variant='contained'
          className='rounded-full shadow-lg'
          onClick={() => {
            setSidebarOpen(true)
            isBelowSmScreen ? setBackdropOpen(false) : setBackdropOpen(true)
          }}
        >
          Select Contact
        </Button>
      )}
    </CardContent>
  ) : (
    <div className='flex flex-col flex-grow bs-full' style={backgroundStyle}>
      {activeUser && (
        <>
          {/* Header do Chat */}
          <div className='flex items-center justify-between border-be plb-[17px] pli-5 backdrop-blur-sm bg-[var(--mui-palette-customColors-chatBg)]/90 border-white/20'>
            {isBelowMdScreen ? (
              <div className='flex items-center gap-4'>
                <IconButton
                  size='small'
                  onClick={() => {
                    setSidebarOpen(true)
                    setBackdropOpen(true)
                  }}
                >
                  <i className='ri-menu-line text-textSecondary' />
                </IconButton>
                <UserAvatar
                  activeUser={activeUser}
                  setBackdropOpen={setBackdropOpen}
                  setUserProfileLeftOpen={setUserProfileRightOpen}
                />
              </div>
            ) : (
              <UserAvatar
                activeUser={activeUser}
                setBackdropOpen={setBackdropOpen}
                setUserProfileLeftOpen={setUserProfileRightOpen}
              />
            )}
            {isBelowMdScreen ? (
              <OptionMenu
                iconClassName='text-textSecondary '
                options={[
                  {
                    text: 'View Contact',
                    menuItemProps: {
                      onClick: () => {
                        setUserProfileRightOpen(true)
                        setBackdropOpen(true)
                      }
                    }
                  },
                  'Mute Notifications',
                  'Block Contact',
                  'Clear Chat',
                  'Block'
                ]}
              />
            ) : (
              <div className='flex items-center gap-1'>
                <IconButton size='small'>
                  <i className='ri-phone-line text-textSecondary' />
                </IconButton>
                <IconButton size='small'>
                  <i className='ri-video-add-line text-textSecondary' />
                </IconButton>
                <IconButton size='small'>
                  <i className='ri-search-line text-textSecondary' />
                </IconButton>
                <OptionMenu
                  iconClassName='text-textSecondary'
                  options={[
                    {
                      text: 'View Contact',
                      menuItemProps: {
                        onClick: () => {
                          setUserProfileRightOpen(true)
                          setBackdropOpen(true)
                        }
                      }
                    },
                    'Mute Notifications',
                    'Block Contact',
                    'Clear Chat',
                    'Block'
                  ]}
                />
              </div>
            )}
          </div>

          {/* Área de Mensagens */}
          <div className='flex-1 overflow-hidden'>
            <ChatLog
              chatStore={chatStore}
              isBelowMdScreen={isBelowMdScreen}
              isBelowSmScreen={isBelowSmScreen}
              isBelowLgScreen={isBelowLgScreen}
            />
          </div>

          {/* Área de Input de Mensagem */}
          <div className='backdrop-blur-sm bg-zinc-800/90 border-t border-white/20'>
            <SendMsgForm
              dispatch={dispatch}
              activeUser={activeUser}
              isBelowSmScreen={isBelowSmScreen}
              messageInputRef={messageInputRef}
            />
          </div>
        </>
      )}

      {/* User Profile Right Drawer */}
      {activeUser && (
        <UserProfileRight
          open={userProfileRightOpen}
          handleClose={() => {
            setUserProfileRightOpen(false)
            setBackdropOpen(false)
          }}
          activeUser={activeUser}
          isBelowSmScreen={isBelowSmScreen}
          isBelowLgScreen={isBelowLgScreen}
        />
      )}
    </div>
  )
}

export default ChatContent

/* 
📝 INSTRUÇÕES DE USO:

1. CONFIGURAÇÃO DO BACKGROUND:
   - Altere BACKGROUND_CONFIG.image para o caminho da sua imagem
   - Ajuste BACKGROUND_CONFIG.opacity (recomendado: 0.05 - 0.15)
   - Use BACKGROUND_CONFIG.enableBlur para adicionar blur effect

2. ESTRUTURA DOS ARQUIVOS:
   public/
   ├── assets/
   │   ├── chat-background.jpg
   │   └── outras-imagens...

3. CUSTOMIZAÇÃO RÁPIDA:
   - Para background mais sutil: opacity: 0.05
   - Para background mais visível: opacity: 0.15
   - Para adicionar blur: enableBlur: true

4. BACKGROUND INTEGRADO:
   - O background é aplicado diretamente no container
   - Usa backgroundBlendMode para melhor integração
   - Não requer elementos separados ou z-index

5. PERFORMANCE:
   - Otimize suas imagens (WebP recomendado)
   - Mantenha tamanhos adequados (1920x1080 para desktop)
   - Background integrado = melhor performance
*/
