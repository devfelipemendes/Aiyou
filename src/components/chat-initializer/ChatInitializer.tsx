import { useEffect, useState } from 'react'

import { Box } from 'lucide-react'

import { Alert, Card, CardContent, Chip, CircularProgress, Typography } from '@mui/material'

import { useAppDispatch, useAppSelector } from '@/redux-store'
import { useActiveChatsManager } from '@/hooks/useActiveChatsManager'

interface ChatInitializerProps {
  children: React.ReactNode
  showDebugInfo?: boolean
  onInitialized?: () => void
}

const ChatInitializer: React.FC<ChatInitializerProps> = ({
  children,
  showDebugInfo = process.env.NODE_ENV === 'development',
  onInitialized
}) => {
  const dispatch = useAppDispatch()

  const [initializationStep, setInitializationStep] = useState<string>('auth-check')
  const [isWebSocketInitialized, setIsWebSocketInitialized] = useState(false)

  const websocketStatus = useAppSelector((state: any) => state.websocketReducer.status)
  const authToken = useAppSelector((state: any) => state.authReducer.token)
  const userId = useAppSelector((state: any) => state.authReducer.user?.id)

  const {
    chats,
    stats,
    connectedChannels,
    loading: chatsLoading,
    isWebSocketConnected,
    error: chatsError
  } = useActiveChatsManager({
    autoConncts: true,
    refetchInterval: 30000,
    maxRetries: 3,
    retryDelay: 2000
  })

  useEffect(() => {
    const initializewebSocket = async () => {
      if (!authToken || !userId) {
        setInitializationStep('auth-error')
        console.error('Usuário não autenticado. Não é possível inicializar WebSocket.')

        return
      }

      setInitializationStep('websocket-init')

      if (websocketStatus === 'connected' && !isWebSocketInitialized) {
        console.log('inicializando WebSocket...')

        try {
          setIsWebSocketInitialized(true)
        } catch (error) {
          console.error('Erro ao inicializar WebSocket:', error)
          setInitializationStep('websocket-error')

          return
        }
      }

      setInitializationStep('chats-loading')
    }

    initializewebSocket()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken, userId, WebSocket, websocketStatus, isWebSocketInitialized, dispatch])
  useEffect(() => {
    if (chatsLoading) {
      setInitializationStep('chats-loading')
    } else if (chats.length > 0) {
      if (isWebSocketConnected) {
        setInitializationStep('channels-connecting')
        setTimeout(() => {
          if (connectedChannels.size > 0) {
            setInitializationStep('ready')
            onInitialized?.()
          }
        }, 3000)
      }
    } else if (!chatsLoading && chats.length === 0) {
      setInitializationStep('no-chats')
    }
  }, [chats, chatsLoading, chatsError, isWebSocketConnected, connectedChannels, onInitialized])

  const renderInitializationStatus = () => {
    const statusConfig = {
      'auth-check': {
        color: 'info' as const,
        icon: '🔐',
        title: 'Verificando autenticação...',
        description: 'Validando credenciais do usuário'
      },
      'auth-error': {
        color: 'error' as const,
        icon: '❌',
        title: 'Erro de autenticação',
        description: 'Usuário não autenticado. Faça login novamente.'
      },
      'websocket-init': {
        color: 'info' as const,
        icon: '🔌',
        title: 'Conectando WebSocket...',
        description: 'Estabelecendo conexão em tempo real'
      },
      'websocket-error': {
        color: 'error' as const,
        icon: '💥',
        title: 'Erro no WebSocket',
        description: 'Falha na conexão em tempo real'
      },
      'chats-loading': {
        color: 'info' as const,
        icon: '📡',
        title: 'Carregando chats ativos...',
        description: 'Buscando conversas em andamento'
      },
      'chats-error': {
        color: 'error' as const,
        icon: '💥',
        title: 'Erro ao carregar chats',
        description: chatsError || 'Falha na API de chats'
      },
      'channels-connecting': {
        color: 'warning' as const,
        icon: '🔄',
        title: 'Conectando canais...',
        description: `Conectando ${chats.length} canais WebSocket`
      },
      'no-chats': {
        color: 'success' as const,
        icon: '✅',
        title: 'Sistema pronto',
        description: 'Nenhum chat ativo no momento'
      },
      ready: {
        color: 'success' as const,
        icon: '🎉',
        title: 'Sistema inicializado',
        description: `${chats.length} chats carregados, ${connectedChannels.size} canais conectados`
      }
    }

    const config = statusConfig[initializationStep as keyof typeof statusConfig]

    return (
      <Box className='flex flex-col items-center gap-4 p-3 min-h-[200px] justify-center'>
        {/* Loading spinner para estados de carregamento */}
        {['auth-check', 'websocket-init', 'chats-loading', 'channels-connecting'].includes(initializationStep) && (
          <CircularProgress size={40} />
        )}

        {/* Alert com status */}
        <Alert
          severity={config.color}
          icon={<span style={{ fontSize: '20px' }}>{config.icon}</span>}
          sx={{ maxWidth: 400 }}
        >
          <Typography variant='subtitle2' gutterBottom>
            {config.title}
          </Typography>
          <Typography variant='body2'>{config.description}</Typography>
        </Alert>

        {/* Debug info em desenvolvimento */}
        {showDebugInfo && (
          <Card sx={{ maxWidth: 600, mt: 2 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                🔧 Debug Info
              </Typography>
              <Box className='flex flex-wrap gap-1 mb-2'>
                <Chip label={`WebSocket: ${websocketStatus}`} size='small' />
                <Chip label={`Chats: ${chats.length}`} size='small' />
                <Chip label={`Canais: ${connectedChannels.size}`} size='small' />
                <Chip label={`Step: ${initializationStep}`} size='small' />
              </Box>

              {stats && (
                <Box>
                  <Typography variant='body2'>
                    📊 Estatísticas: {stats.total} total | {stats.aiMode} IA | {stats.operatorMode} operador
                  </Typography>
                  <Typography variant='body2'>
                    📱 Por canal:{' '}
                    {Object.entries(stats.bySource)
                      .map(([source, count]) => `${source}: ${count}`)
                      .join(', ')}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {/* Botões de ação para erros */}
        {['chats-error', 'websocket-error'].includes(initializationStep) && (
          <Box className='mt-2'>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '8px 16px',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🔄 Tentar novamente
            </button>
          </Box>
        )}
      </Box>
    )
  }

  if (initializationStep === 'ready') {
    return <>{children}</>
  }

  return renderInitializationStatus()
}

export default ChatInitializer
