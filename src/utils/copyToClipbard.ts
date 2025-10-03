import { useState, useCallback, useRef } from 'react'

import copy from 'copy-to-clipboard'
import { toast } from 'react-toastify'

function copyToClipboard(textToClipboard: string, textToast?: string) {
  const copySuccess = copy(textToClipboard)

  if (copySuccess) {
    toast.info(textToast ?? 'Texto copiado para a área de transferência!')
  } else {
    toast.error('Falha ao copiar para a área de transferência.')
  }
}

// file: src/hooks/useCopyToClipboard.ts

interface UseCopyToClipboardOptions {
  successDuration?: number
  showToast?: boolean
  customToastMessage?: string
  onSuccess?: (text: string) => void
  onError?: (error: string) => void
}

interface UseCopyToClipboardReturn {
  isCopied: boolean
  isLoading: boolean
  copyText: (text: string, customMessage?: string) => Promise<boolean>
  resetState: () => void
  lastCopiedText: string | null
}

export const useCopyToClipboard = (options: UseCopyToClipboardOptions = {}): UseCopyToClipboardReturn => {
  const { successDuration = 2000, showToast = true, customToastMessage, onSuccess, onError } = options

  const [isCopied, setIsCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [lastCopiedText, setLastCopiedText] = useState<string | null>(null)

  const timeoutRef = useRef<NodeJS.Timeout>()

  const copyText = useCallback(
    async (text: string, overrideMessage?: string): Promise<boolean> => {
      if (!text.trim()) {
        const errorMsg = 'Texto vazio ou inválido fornecido'

        onError?.(errorMsg)

        return false
      }

      if (isLoading) return false

      setIsLoading(true)

      try {
        // Limpa timeout anterior se existir
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        // Determina a mensagem do toast
        const toastMessage = overrideMessage || customToastMessage || 'Texto copiado com sucesso!'

        // Usa a função existente do projeto
        if (showToast) {
          copyToClipboard(text, toastMessage)
        } else {
          // Se não quiser toast, usa apenas a lib copy-to-clipboard
          const copy = (await import('copy-to-clipboard')).default
          const success = copy(text)

          if (!success) throw new Error('Falha ao copiar')
        }

        // Atualiza estados
        setIsCopied(true)
        setLastCopiedText(text)
        onSuccess?.(text)

        // Auto-reset após duração especificada
        timeoutRef.current = setTimeout(() => {
          setIsCopied(false)
        }, successDuration)

        return true
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido ao copiar'

        onError?.(errorMsg)

        return false
      } finally {
        setIsLoading(false)
      }
    },
    [customToastMessage, showToast, successDuration, onSuccess, onError, isLoading]
  )

  const resetState = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    setIsCopied(false)
    setIsLoading(false)
    setLastCopiedText(null)
  }, [])

  // // Cleanup no unmount
  // const cleanup = useCallback(() => {
  //   if (timeoutRef.current) {
  //     clearTimeout(timeoutRef.current)
  //   }
  // }, [])

  // // Effect para cleanup no unmount seria adicionado se necessário
  // // useEffect(() => cleanup, [cleanup])

  return {
    isCopied,
    isLoading,
    copyText,
    resetState,
    lastCopiedText
  }
}
