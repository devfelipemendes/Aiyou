'use client'
import { Typography } from '@mui/material'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'

// Third-party Imports

type ChatViewProps = {
  open: boolean
  setOpen: (open: boolean) => void
  clientId: string
  clientData: any
  messages: any
  channel: any
  operatorName: any
}

const ChatViewDialog = ({ open, setOpen, clientId, clientData, messages, channel, operatorName }: ChatViewProps) => {
  // States
  return (
    <>
      <Dialog fullWidth maxWidth='xs' open={open} onClose={() => setOpen(false)} closeAfterTransition={false}>
        <DialogContent className='flex items-center flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
          <i className='ri-error-warning-line text-[88px] mbe-6 text-warning' />
          <Typography>{clientId}</Typography>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ChatViewDialog
