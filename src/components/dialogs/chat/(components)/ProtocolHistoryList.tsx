// src/components/dialogs/chat-monitoring/(components)/ProtocolHistoryList.tsx
import { ListItemButton, ListItemText, Typography, Box } from '@mui/material'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// 🎯 IMPORTAR TIPOS DA API
import type { ProtocolHistoryItem } from '@/api/endpoints/chat/protocolHistory'
import CustomAvatar from '@/@core/components/mui/Avatar'
import { getInitials } from '@/utils/getInitials'

// 🎯 PROPS DO COMPONENTE
interface ProtocolHistoryListProps {
  historyData: ProtocolHistoryItem[]
  currentProtocol?: string // Para destacar o protocolo atual
  onProtocolSelect: (protocol: string, protocolData: ProtocolHistoryItem) => void // 🔥 CALLBACK para seleção
}

export const ProtocolHistoryList = ({ historyData, currentProtocol, onProtocolSelect }: ProtocolHistoryListProps) => {
  return (
    <Box>
      {historyData.map(protocolItem => {
        const isCurrentProtocol = protocolItem.protocol === currentProtocol

        return (
          <Box key={protocolItem.protocol}>
            <ListItemButton
              onClick={() => onProtocolSelect(protocolItem.protocol, protocolItem)}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                bgcolor: isCurrentProtocol ? 'primary.main' : 'background.paper',
                '&:hover': {
                  bgcolor: 'primary.light',
                  color: 'white',

                  // ✅ APLICAR BRANCO EM TODOS OS TYPOGRAPHY FILHOS
                  '& .MuiTypography-root': {
                    color: 'white !important'
                  },

                  // ✅ APLICAR BRANCO EM TODOS OS ELEMENTOS Typography
                  '& Typography': {
                    color: 'white !important'
                  }
                }
              }}
            >
              <Box>
                <CustomAvatar skin={'light'} color={'warning'} size={40}>
                  {getInitials(protocolItem.identifier || 'Desconhecido')}
                </CustomAvatar>
              </Box>

              <ListItemText
                primary={
                  <Box display='flex' justifyContent='space-between' alignItems='center' mb={0.5}>
                    <Typography
                      variant='h6'
                      fontWeight={isCurrentProtocol ? 'bold' : 'normal'}
                      sx={{
                        color: isCurrentProtocol ? 'white' : 'var(--mui-palette-primary-main)'
                      }}
                    >
                      # {protocolItem.identifier || 'Desconhecido'}
                    </Typography>
                    <Typography color={isCurrentProtocol ? 'white' : 'text.prymary'} variant='caption'>
                      {protocolItem.createdAt
                        ? format(new Date(protocolItem.createdAt), 'dd/MM/yyyy', { locale: ptBR })
                        : '--'}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box>
                    {/* Data de criação */}
                    {protocolItem.createdAt && (
                      <Typography
                        variant='caption'
                        color={isCurrentProtocol ? ' white' : 'textPrimary'}
                        display='block'
                        sx={{ mt: 0.5 }}
                      >
                        Atendido por: {protocolItem.assistant_name || protocolItem.operator_name || 'Desconhecido'}
                      </Typography>
                    )}
                  </Box>
                }
              />
            </ListItemButton>
          </Box>
        )
      })}
    </Box>
  )
}
