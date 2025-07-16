import React, { useEffect, useRef } from 'react'

import { Card, CardContent, CardHeader, Chip, Typography, Box } from '@mui/material'

import { useTheme } from '@mui/material/styles'

import ChatLog from '../chatLog/chatLog'

import CustomIconButton from '@core/components/mui/IconButton'

const chatFakeData = {
  profileUser: {
    id: 1,
    fullName: 'João Silva',
    avatar: '/images/avatars/joao.jpg',
    status: 'online'
  },

  contacts: [
    {
      id: 2,
      fullName: 'Maria Santos',
      avatar: '/images/avatars/maria.jpg',
      avatarColor: 'primary',
      status: 'online'
    },
    {
      id: 3,
      fullName: 'Pedro Oliveira',
      avatar: '', // Sem avatar - vai mostrar iniciais
      avatarColor: 'secondary',
      status: 'away'
    },
    {
      id: 4,
      fullName: 'Ana Costa',
      avatar: '/images/avatars/ana.jpg',
      avatarColor: 'success',
      status: 'offline'
    }
  ],

  activeUser: {
    id: 2,
    fullName: 'Maria Santos',
    avatar: '/images/avatars/maria.jpg',
    status: 'online'
  },

  chats: [
    {
      userId: 2,
      chat: [
        {
          senderId: 2,
          time: '2025-01-14T09:00:00Z',
          message: 'Oi João! Como você está?',
          msgStatus: {
            isSent: true,
            isDelivered: true,
            isSeen: true
          }
        },
        {
          senderId: 1,
          time: '2025-01-14T09:02:00Z',
          message: 'Oi Maria! Estou bem, obrigado! E você?',
          msgStatus: {
            isSent: true,
            isDelivered: true,
            isSeen: true
          }
        },
        {
          senderId: 1,
          time: '2025-01-14T09:02:30Z',
          message: 'Como foi o fim de semana?',
          msgStatus: {
            isSent: true,
            isDelivered: true,
            isSeen: true
          }
        },
        {
          senderId: 2,
          time: '2025-01-14T09:05:00Z',
          message: 'Também estou bem! 😊',
          msgStatus: {
            isSent: true,
            isDelivered: true,
            isSeen: true
          }
        },
        {
          senderId: 2,
          time: '2025-01-14T09:05:15Z',
          message: 'O fim de semana foi ótimo! Fui à praia com a família.',
          msgStatus: {
            isSent: true,
            isDelivered: true,
            isSeen: true
          }
        },
        {
          senderId: 2,
          time: '2025-01-14T09:05:30Z',
          message: 'E o seu? Conseguiu descansar?',
          msgStatus: {
            isSent: true,
            isDelivered: true,
            isSeen: true
          }
        },
        {
          senderId: 1,
          time: '2025-01-14T09:08:00Z',
          message: 'Que legal! A praia deve ter estado maravilhosa com esse sol.',
          msgStatus: {
            isSent: true,
            isDelivered: true,
            isSeen: true
          }
        },
        {
          senderId: 1,
          time: '2025-01-14T09:08:30Z',
          message: 'Sim, consegui descansar bastante. Assisti alguns filmes e li um livro.',
          msgStatus: {
            isSent: true,
            isDelivered: true,
            isSeen: true
          }
        },
        {
          senderId: 2,
          time: '2025-01-14T09:12:00Z',
          message: 'Que livro você leu?',
          msgStatus: {
            isSent: true,
            isDelivered: true,
            isSeen: true
          }
        },
        {
          senderId: 1,
          time: '2025-01-14T09:15:00Z',
          message: "Li 'O Alquimista' do Paulo Coelho. Já tinha lido antes, mas resolvi reler.",
          msgStatus: {
            isSent: true,
            isDelivered: true,
            isSeen: true
          }
        },
        {
          senderId: 1,
          time: '2025-01-14T09:15:30Z',
          message: 'É um daqueles livros que sempre trazem algo novo a cada leitura.',
          msgStatus: {
            isSent: true,
            isDelivered: true,
            isSeen: true
          }
        },
        {
          senderId: 2,
          time: '2025-01-14T09:18:00Z',
          message: 'Concordo! É um livro incrível. Já li várias vezes também.',
          msgStatus: {
            isSent: true,
            isDelivered: true,
            isSeen: true
          }
        },
        {
          senderId: 2,
          time: '2025-01-14T09:18:30Z',
          message: 'Você tem alguma recomendação de outros livros?',
          msgStatus: {
            isSent: true,
            isDelivered: true,
            isSeen: true
          }
        },
        {
          senderId: 1,
          time: '2025-01-14T09:22:00Z',
          message: "Tenho sim! Recomendo 'Sapiens' do Yuval Noah Harari.",
          msgStatus: {
            isSent: true,
            isDelivered: true,
            isSeen: true
          }
        },
        {
          senderId: 1,
          time: '2025-01-14T09:22:30Z',
          message: 'É sobre a história da humanidade. Muito interessante!',
          msgStatus: {
            isSent: true,
            isDelivered: true,
            isSeen: true
          }
        },
        {
          senderId: 2,
          time: '2025-01-14T09:25:00Z',
          message: 'Ótima recomendação! Vou procurar esse livro.',
          msgStatus: {
            isSent: true,
            isDelivered: true,
            isSeen: true
          }
        },
        {
          senderId: 2,
          time: '2025-01-14T09:25:30Z',
          message: 'Obrigada pela dica! 📚',
          msgStatus: {
            isSent: true,
            isDelivered: true,
            isSeen: false
          }
        },
        {
          senderId: 1,
          time: '2025-01-14T09:28:00Z',
          message: 'Por nada! Tenho certeza de que você vai gostar.',
          msgStatus: {
            isSent: true,
            isDelivered: false,
            isSeen: false
          }
        }
      ]
    },
    {
      userId: 3,
      chat: [
        {
          senderId: 3,
          time: '2025-01-14T08:30:00Z',
          message: 'Bom dia, João!',
          msgStatus: {
            isSent: true,
            isDelivered: true,
            isSeen: true
          }
        },
        {
          senderId: 1,
          time: '2025-01-14T08:35:00Z',
          message: 'Bom dia, Pedro! Como vai?',
          msgStatus: {
            isSent: true,
            isDelivered: true,
            isSeen: true
          }
        },
        {
          senderId: 3,
          time: '2025-01-14T08:40:00Z',
          message: 'Tudo bem! Você viu o jogo ontem?',
          msgStatus: {
            isSent: true,
            isDelivered: true,
            isSeen: true
          }
        },
        {
          senderId: 1,
          time: '2025-01-14T08:45:00Z',
          message: 'Vi sim! Que jogo incrível! ⚽',
          msgStatus: {
            isSent: true,
            isDelivered: true,
            isSeen: true
          }
        }
      ]
    },
    {
      userId: 4,
      chat: [
        {
          senderId: 4,
          time: '2025-01-14T07:00:00Z',
          message: 'João, você tem o relatório de ontem?',
          msgStatus: {
            isSent: true,
            isDelivered: true,
            isSeen: true
          }
        },
        {
          senderId: 1,
          time: '2025-01-14T07:05:00Z',
          message: 'Oi Ana! Sim, tenho. Vou enviar agora.',
          msgStatus: {
            isSent: true,
            isDelivered: true,
            isSeen: true
          }
        },
        {
          senderId: 1,
          time: '2025-01-14T07:06:00Z',
          message: 'Relatório enviado por email! 📧',
          msgStatus: {
            isSent: true,
            isDelivered: true,
            isSeen: true
          }
        },
        {
          senderId: 4,
          time: '2025-01-14T07:10:00Z',
          message: 'Perfeito! Muito obrigada! 🙏',
          msgStatus: {
            isSent: true,
            isDelivered: true,
            isSeen: true
          }
        }
      ]
    }
  ]
}

type CardMonitorProps = {
  onClickMove: () => void
}

export default function CardMonitor({ onClickMove }: CardMonitorProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const theme = useTheme()

  const modeTheme = theme.palette.mode

  // Faz scroll para o fim sempre que o chatStore mudar
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatFakeData])

  useEffect(() => {
    console.log(modeTheme)
  }, [])

  return (
    <Card>
      <CardHeader
        title='ClienteProtocol'
        action={
          <Box>
            <Chip label='Status do chat' color='success' className='mr-2' />
            <CustomIconButton color='primary' variant='outlined' onClick={onClickMove}>
              <i className='ri-drag-move-2-fill' />
            </CustomIconButton>
          </Box>
        }
      />
      <CardContent>
        <Card>
          <CardContent
            ref={scrollContainerRef}
            sx={{
              position: 'relative',
              minHeight: '200px',
              maxHeight: '300px',
              overflowY: 'auto',
              backgroundImage: `${modeTheme === 'light' ? 'linear-gradient(rgba(255,255,255,0.95), rgba(255,255,255,0.95))' : 'linear-gradient( rgba(28, 24, 48, 0.95), rgba(40,36,61,0.95))'}, url("/images/identidadeVisual/bgChat.png")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box className='flex flex-row'>
                <ChatLog
                  chatStore={chatFakeData}
                  isBelowLgScreen={false}
                  isBelowMdScreen={false}
                  isBelowSmScreen={false}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Box className='flex flex-row justify-between mt-5'>
          <Typography variant='subtitle2' color='textDisabled'>
            Em andamento há: xh
          </Typography>
          <Typography variant='subtitle2' color='textDisabled'>
            Sendo atendido por: atendente
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}
