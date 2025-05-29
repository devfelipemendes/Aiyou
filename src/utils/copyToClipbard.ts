import copy from 'copy-to-clipboard'
import { toast } from 'react-toastify'

export default function copyToClipboard(textToClipboard: string, textToast?: string) {
  const copySuccess = copy(textToClipboard)

  if (copySuccess) {
    toast.info(textToast ?? 'Texto copiado para a área de transferência!')
  } else {
    toast.error('Falha ao copiar para a área de transferência.')
  }
}
