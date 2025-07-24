// src/components/dialogs/chat-monitoring/(components)/ProtocolHistoryList.tsx
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Box,
  Chip
} from '@mui/material'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// 🎯 IMPORTAR TIPOS DA API
import type { ProtocolHistoryItem } from '@/api/endpoints/chat/protocolHistory'

// 🎯 PROPS DO COMPONENTE
interface ProtocolHistoryListProps {
  historyData: ProtocolHistoryItem[]
  currentProtocol?: string // Para destacar o protocolo atual
  onProtocolSelect: (protocol: string, protocolData: ProtocolHistoryItem) => void // 🔥 CALLBACK para seleção
}

export const ProtocolHistoryList = ({ historyData, currentProtocol, onProtocolSelect }: ProtocolHistoryListProps) => {
  // 🎯 FUNÇÃO: Renderizar preview da última mensagem
  const renderLastMessagePreview = (protocolItem: ProtocolHistoryItem) => {
    const history = protocolItem.history || []

    if (!history || history.length === 0) {
      return (
        <Typography variant='caption' color='text.secondary'>
          Nenhuma mensagem
        </Typography>
      )
    }

    const lastMessage = history[history.length - 1]

    return (
      <Typography variant='caption' color='text.secondary' noWrap>
        <strong>{lastMessage.role === 'user' ? 'Cliente' : 'Assistente'}:</strong>{' '}
        {lastMessage.content.length > 40 ? `${lastMessage.content.substring(0, 40)}...` : lastMessage.content}
      </Typography>
    )
  }

  return (
    <List sx={{ p: 0 }}>
      {historyData.map(protocolItem => {
        const isCurrentProtocol = protocolItem.protocol === currentProtocol

        return (
          <ListItem key={protocolItem.protocol} disablePadding>
            <ListItemButton
              onClick={() => onProtocolSelect(protocolItem.protocol, protocolItem)}
              sx={{
                py: 1.5,
                px: 2,
                borderRadius: 1,
                mb: 0.5,
                ...(isCurrentProtocol && {
                  bgcolor: 'primary.light',
                  '&:hover': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText'
                  }
                })
              }}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    fontSize: '0.75rem',
                    bgcolor: isCurrentProtocol ? 'primary.main' : 'grey.400'
                  }}
                >
                  {protocolItem.protocol.slice(-4)}
                </Avatar>
              </ListItemAvatar>

              <ListItemText
                primary={
                  <Box display='flex' justifyContent='space-between' alignItems='center' mb={0.5}>
                    <Typography
                      variant='body2'
                      fontWeight={isCurrentProtocol ? 'bold' : 'normal'}
                      sx={{
                        color: isCurrentProtocol ? 'primary.main' : 'text.primary'
                      }}
                    >
                      Protocol {protocolItem.protocol.slice(-8)}
                      {isCurrentProtocol && (
                        <Chip
                          label='✨ Atual'
                          size='small'
                          sx={{ ml: 1, height: 18, fontSize: '0.65rem' }}
                          color='secondary'
                        />
                      )}
                    </Typography>
                    <Chip
                      label={`${protocolItem.messageCount || protocolItem.history?.length || 0} msg${(protocolItem.messageCount || protocolItem.history?.length || 0) !== 1 ? 's' : ''}`}
                      size='small'
                      variant='outlined'
                      sx={{
                        fontSize: '0.65rem',
                        height: 20,
                        color: isCurrentProtocol ? 'primary.main' : 'text.secondary'
                      }}
                    />
                  </Box>
                }
                secondary={
                  <Box>
                    {/* Preview da última mensagem */}
                    {renderLastMessagePreview(protocolItem)}

                    {/* Data de criação */}
                    {protocolItem.createdAt && (
                      <Typography variant='caption' color='text.secondary' display='block' sx={{ mt: 0.5 }}>
                        📅 {format(new Date(protocolItem.createdAt), "dd/MM 'às' HH:mm", { locale: ptBR })}
                      </Typography>
                    )}
                  </Box>
                }
              />
            </ListItemButton>
          </ListItem>
        )
      })}
    </List>
  )
}
