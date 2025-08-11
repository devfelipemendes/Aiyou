// React Imports
import { useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent, RefObject, MouseEvent } from 'react'

// MUI Imports
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'

// Third-party Imports
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'

// Type Imports

import type { AppDispatch } from '@/redux-store'

// Component Imports
import CustomIconButton from '@core/components/mui/IconButton'
import { useOperatorInterventionMutation } from '@/api/endpoints/chat/instructionOperator'

type Props = {
  dispatch?: AppDispatch

  isBelowSmScreen: boolean
  messageInputRef: RefObject<HTMLDivElement>
  placeholder: string
  isInstruction?: boolean
  onSendMessage?: (content: string) => Promise<void>
  questionId?: string
  disabled?: boolean
  onInstructionSent?: (questionId: string) => void // 👈 NOVO CALLBACK
  onCancel?: () => void
  onInstructionSending?: (questionId: string) => void
  onInstructionError?: (questionId: string) => void
}

// Emoji Picker Component for selecting emojis
const EmojiPicker = ({
  onChange,
  isBelowSmScreen,
  openEmojiPicker,
  setOpenEmojiPicker,
  anchorRef
}: {
  onChange: (value: string) => void
  isBelowSmScreen: boolean
  openEmojiPicker: boolean
  setOpenEmojiPicker: (value: boolean | ((prevVar: boolean) => boolean)) => void
  anchorRef: RefObject<HTMLButtonElement>
}) => {
  return (
    <>
      <Popper
        open={openEmojiPicker}
        transition
        disablePortal
        placement='top-start'
        className='z-[12]'
        anchorEl={anchorRef.current}
      >
        {({ TransitionProps, placement }) => (
          <Fade {...TransitionProps} style={{ transformOrigin: placement === 'top-start' ? 'right top' : 'left top' }}>
            <Paper>
              <ClickAwayListener onClickAway={() => setOpenEmojiPicker(false)}>
                <span>
                  <Picker
                    emojiSize={18}
                    theme='light'
                    data={data}
                    maxFrequentRows={1}
                    onEmojiSelect={(emoji: any) => {
                      onChange(emoji.native)
                      setOpenEmojiPicker(false)
                    }}
                    {...(isBelowSmScreen && { perLine: 8 })}
                  />
                </span>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

const SendMsgForm = ({
  isBelowSmScreen,
  messageInputRef,
  placeholder,
  isInstruction,
  questionId,
  onSendMessage,
  disabled,
  onInstructionError,
  onInstructionSending,

  onInstructionSent
}: Props) => {
  // States
  const [msg, setMsg] = useState('')
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false)

  const [operatorIntervention, { isLoading: isOperatorLoading }] = useOperatorInterventionMutation()

  // Refs
  const anchorRef = useRef<HTMLButtonElement>(null)

  const open = Boolean(anchorEl)

  const handleToggle = () => {
    setOpenEmojiPicker(prevOpen => !prevOpen)
  }

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(prev => (prev ? null : event.currentTarget))
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleSendMsg = async (event: FormEvent | KeyboardEvent, msg: string) => {
    event.preventDefault()

    if (msg.trim() === '') return

    try {
      if (onSendMessage) {
        console.log('Enviando mensagem via onSendMessage', msg)

        await onSendMessage(msg)
        setMsg('')

        return
      }

      // 🎯 SE FOR INSTRUÇÃO DO OPERADOR
      if (isInstruction && questionId) {
        console.log('📨 Enviando intervenção do operador:', { questionId, content: msg })

        if (onInstructionSending) {
          onInstructionSending(questionId)
        }

        await operatorIntervention({
          questionId,
          content: msg
        }).unwrap()

        console.log('✅ Intervenção do operador enviada com sucesso!')

        setMsg('')

        if (onInstructionSent) {
          onInstructionSent(questionId)
        }

        // TODO: Fechar modal ou dar feedback visual
        // onSuccess?.() // Se você tiver callback de sucesso
      } else {
        // 🎯 MENSAGEM NORMAL (lógica existente)
        console.log('📨 Enviando mensagem normal:', msg)

        setMsg('')
      }
    } catch (error) {
      console.error('❌ Erro ao enviar:', error)

      if (isInstruction && questionId && onInstructionError) {
        onInstructionError(questionId)
      }

      // TODO: Mostrar toast/snackbar de erro
      // showError('Erro ao enviar mensagem')
    }
  }

  const handleInputEndAdornment = () => {
    return (
      <div className='flex items-center gap-1'>
        {isBelowSmScreen ? (
          <>
            <IconButton
              size='small'
              id='option-menu'
              aria-haspopup='true'
              {...(open && { 'aria-expanded': true, 'aria-controls': 'share-menu' })}
              onClick={handleClick}
              ref={anchorRef}
            >
              <i className='ri-more-2-line text-textPrimary' />
            </IconButton>
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
              <MenuItem
                onClick={() => {
                  handleToggle()
                  handleClose()
                }}
                className='justify-center'
              >
                <i className='ri-emotion-happy-line text-textPrimary' />
              </MenuItem>
              <MenuItem onClick={handleClose} className='justify-center'>
                <i className='ri-mic-line text-textPrimary' />
              </MenuItem>
              <MenuItem onClick={handleClose} className='p-0'>
                <label htmlFor='upload-img' className='plb-2 pli-5'>
                  <i className='ri-attachment-2 text-textPrimary' />
                  <input hidden type='file' id='upload-img' />
                </label>
              </MenuItem>
            </Menu>
            <EmojiPicker
              anchorRef={anchorRef}
              openEmojiPicker={openEmojiPicker}
              setOpenEmojiPicker={setOpenEmojiPicker}
              isBelowSmScreen={isBelowSmScreen}
              onChange={value => {
                setMsg(msg + value)

                if (messageInputRef.current) {
                  messageInputRef.current.focus()
                }
              }}
            />
          </>
        ) : (
          <>
            <IconButton ref={anchorRef} size='small' onClick={handleToggle}>
              <i className='ri-emotion-happy-line text-textPrimary' />
            </IconButton>
            <EmojiPicker
              anchorRef={anchorRef}
              openEmojiPicker={openEmojiPicker}
              setOpenEmojiPicker={setOpenEmojiPicker}
              isBelowSmScreen={isBelowSmScreen}
              onChange={value => {
                setMsg(msg + value)

                if (messageInputRef.current) {
                  messageInputRef.current.focus()
                }
              }}
            />
            <IconButton size='small' disabled>
              <i className='ri-mic-line text-textPrimary' />
            </IconButton>
            <IconButton size='small' component='label' htmlFor='upload-img' disabled>
              <i className='ri-attachment-2 text-textPrimary' />
              <input hidden type='file' id='upload-img' />
            </IconButton>
          </>
        )}
        {isBelowSmScreen ? (
          <CustomIconButton
            variant='contained'
            color='primary'
            type='submit'
            disabled={disabled || isOperatorLoading} // 👈 LOADING STATE
          >
            {disabled || isOperatorLoading ? (
              <i className='ri-loader-4-line animate-spin' /> // 👈 LOADING ICON
            ) : (
              <i className='ri-send-plane-line' />
            )}
          </CustomIconButton>
        ) : (
          <Button
            variant='contained'
            size='small'
            color='primary'
            type='submit'
            disabled={disabled || isOperatorLoading} // 👈 LOADING STATE
            endIcon={
              disabled || isOperatorLoading ? (
                <i className='ri-loader-4-line animate-spin' /> // 👈 LOADING ICON
              ) : (
                <i className='ri-send-plane-line' />
              )
            }
          >
            {disabled || isOperatorLoading ? 'Enviando...' : 'Enviar'} {/* 👈 TEXTO DINÂMICO */}
          </Button>
        )}
      </div>
    )
  }

  return (
    <form
      autoComplete='off'
      onSubmit={event => handleSendMsg(event, msg)}
      className={!isInstruction ? ' bg-[var(--mui-palette-customColors-chatBg)]' : ''}
    >
      <TextField
        fullWidth
        multiline
        maxRows={4}
        placeholder={placeholder}
        value={msg}
        className={!isInstruction ? 'p-5' : ''}
        onChange={e => setMsg(e.target.value)}
        sx={{
          '& fieldset': { border: '0' },
          '& .MuiOutlinedInput-root': {
            background: 'var(--mui-palette-background-paper)',
            boxShadow: 'var(--mui-customShadows-xs)'
          }
        }}
        onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            handleSendMsg(e, msg)
          }
        }}
        size='small'
        inputRef={messageInputRef}
        slotProps={{ input: { endAdornment: handleInputEndAdornment() } }}
      />
    </form>
  )
}

export default SendMsgForm
