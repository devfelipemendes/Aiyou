import { useMemo } from 'react'

import Grid from '@mui/material/Grid2'
import { Avatar, Box, CardContent, Dialog, DialogContent, Divider, IconButton, Typography } from '@mui/material'
import classnames from 'classnames'

import { useGetProtocolHistoryQuery } from '@/api/endpoints/protocols/protocols'

type Chat_2Props = {
  open: boolean
  setOpen: (open: boolean) => void
  protocol: string
  assistantName: string
}

const ChatLog_2 = ({ open, setOpen, protocol, assistantName }: Chat_2Props) => {
  const { data, isLoading } = useGetProtocolHistoryQuery({ protocol })

  const formattedMessages = useMemo(() => {
    if (!data?.data) return []

    return data.data.map(msg => ({
      id: msg.id,
      senderRole: msg.role,
      senderName: msg.operator_name || (msg.role === 'assistant' ? assistantName || 'Assistente' : 'Cliente'),
      message: msg.content,
      time: new Date(msg.created_at).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }))
  }, [data])

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <Dialog open={open} maxWidth='md' fullWidth>
      <DialogContent className='overflow-visible relative'>
        <Box className='absolute top-[1%] right-[5%] z-[999999999]'>
          <IconButton onClick={handleClose} className='fixed'>
            <i className='ri-close-line' />
          </IconButton>
        </Box>

        <Grid size={{ xs: 12, sm: 12, md: 12 }} className='mb-6 mt-2 w-full'>
          <Typography className='flex justify-start items-center gap-2' variant='h4'>
            Protocolo - <Typography variant='h5'>{protocol}</Typography>
          </Typography>
          <Divider orientation='horizontal' />
        </Grid>

        <CardContent>
          {isLoading && <Typography>Carregando...</Typography>}

          {formattedMessages.map(msg => {
            const isSender = msg.senderRole === 'assistant'

            return (
              <div
                key={msg.id}
                className={classnames('flex gap-3 mb-4', {
                  'flex-row-reverse': isSender
                })}
              >
                {/* Avatar alinhado verticalmente com o nome */}
                <Avatar className='self-start'>{msg.senderName.charAt(0)}</Avatar>

                {/* Coluna de nome e mensagem */}
                <div className={classnames('flex flex-col', { 'items-end': isSender })}>
                  <Typography variant='caption' color='text.secondary'>
                    {msg.senderName}
                  </Typography>

                  <Box
                    className={classnames('px-3 py-2 rounded-lg shadow-sm whitespace-pre-wrap mt-1', {
                      'bg-primary text-white': isSender,
                      'bg-gray-100 text-black': !isSender
                    })}
                    sx={{ maxWidth: '300px' }}
                  >
                    {msg.message}
                  </Box>

                  <Typography variant='caption' color='text.disabled' className='mt-1'>
                    {msg.time}
                  </Typography>
                </div>
              </div>
            )
          })}
        </CardContent>
      </DialogContent>
    </Dialog>
  )
}

export default ChatLog_2
