import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography
} from '@mui/material'
import { ChevronDown } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import type { ProtocolHistoryItem } from '@/api/endpoints/chat/protocolHistory'

// 🎯 COMPONENTE: Accordion para cada protocolo histórico
interface ProtocolHistoryAccordionProps {
  protocolData: ProtocolHistoryItem
  isCurrentProtocol: boolean
  isExpanded: boolean
  onToggle: () => void
}

export const ProtocolHistoryAccordion = ({
  protocolData,
  isCurrentProtocol,
  isExpanded,
  onToggle
}: ProtocolHistoryAccordionProps) => {
  const { protocol, history, createdAt, messageCount } = protocolData

  return (
    <Accordion
      expanded={isExpanded}
      onChange={onToggle}
      sx={{
        mb: 1,
        ...(isCurrentProtocol && {
          bgcolor: 'primary.light',
          '& .MuiAccordionSummary-root': {
            bgcolor: 'primary.main',
            color: 'primary.contrastText'
          }
        })
      }}
    >
      <AccordionSummary expandIcon={<ChevronDown size={16} />}>
        <Box display='flex' justifyContent='space-between' width='100%' alignItems='center'>
          <Box>
            <Typography variant='body2' fontWeight={isCurrentProtocol ? 'bold' : 'normal'}>
              {protocol}
              {isCurrentProtocol && <Chip label='✨ Atual' size='small' sx={{ ml: 1, height: 20 }} color='secondary' />}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {createdAt && format(new Date(createdAt), "dd/MM 'às' HH:mm", { locale: ptBR })}
            </Typography>
          </Box>
          <Chip
            label={`${messageCount} msg${messageCount !== 1 ? 's' : ''}`}
            size='small'
            variant='outlined'
            sx={{ fontSize: '0.7rem' }}
          />
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 1 }}>
        {history.length === 0 ? (
          <Typography variant='body2' color='text.secondary' textAlign='center'>
            Nenhuma mensagem
          </Typography>
        ) : (
          <List dense sx={{ p: 0 }}>
            {history.slice(0, 3).map(
              (
                { message }: any // Mostrar só as 3 primeiras
              ) => (
                <ListItem key={message.id} sx={{ px: 0, py: 0.5 }}>
                  <ListItemAvatar sx={{ minWidth: 24 }}>
                    <Avatar sx={{ width: 20, height: 20, fontSize: '0.7rem' }}>
                      {message.role === 'user' ? '👤' : '🤖'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant='caption' noWrap>
                        {message.content.length > 40 ? `${message.content.substring(0, 40)}...` : message.content}
                      </Typography>
                    }
                    secondary={
                      <Typography variant='caption' color='text.secondary'>
                        {format(new Date(message.created_at), 'HH:mm')}
                      </Typography>
                    }
                  />
                </ListItem>
              )
            )}
            {history.length > 3 && (
              <Typography variant='caption' color='text.secondary' textAlign='center' display='block'>
                +{history.length - 3} mensagens...
              </Typography>
            )}
          </List>
        )}
      </AccordionDetails>
    </Accordion>
  )
}
