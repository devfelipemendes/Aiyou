// file: src/hooks/useDownloadPDF.ts
import { useState, useCallback } from 'react'

interface UseDownloadPDFOptions {
  onSuccess?: (filename: string) => void
  onError?: (error: string) => void
  showToast?: boolean
  customFilename?: string
}

interface UseDownloadPDFReturn {
  isDownloading: boolean
  downloadPDF: (url: string, filename?: string) => Promise<boolean>
  downloadError: string | null
  clearError: () => void
}

export const useDownloadPDF = (options: UseDownloadPDFOptions = {}): UseDownloadPDFReturn => {
  const { onSuccess, onError, showToast = true, customFilename } = options

  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const downloadPDF = useCallback(
    async (url: string, overrideFilename?: string): Promise<boolean> => {
      if (!url || !url.trim()) {
        const errorMsg = 'URL do PDF não fornecida'

        setDownloadError(errorMsg)
        onError?.(errorMsg)

        return false
      }

      if (isDownloading) return false

      setIsDownloading(true)
      setDownloadError(null)

      try {
        // Faz o fetch do PDF
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Accept: 'application/pdf'
          }
        })

        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`)
        }

        // Verifica se é realmente um PDF
        const contentType = response.headers.get('content-type')

        if (!contentType?.includes('application/pdf')) {
          console.warn('Tipo de conteúdo não é PDF:', contentType)
        }

        // Converte para blob
        const blob = await response.blob()

        if (blob.size === 0) {
          throw new Error('Arquivo PDF está vazio')
        }

        // Gera nome do arquivo
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')
        const defaultFilename = `boleto_${timestamp}.pdf`
        const filename = overrideFilename || customFilename || defaultFilename

        // Cria URL temporária do blob
        const blobUrl = window.URL.createObjectURL(blob)

        // Cria elemento <a> para download
        const link = document.createElement('a')

        link.href = blobUrl
        link.download = filename
        link.style.display = 'none'

        // Adiciona ao DOM e clica
        document.body.appendChild(link)
        link.click()

        // Cleanup
        document.body.removeChild(link)
        window.URL.revokeObjectURL(blobUrl)

        // Toast de sucesso
        if (showToast) {
          const { toast } = await import('react-toastify')

          toast.success(`Boleto baixado: ${filename}`)
        }

        onSuccess?.(filename)

        return true
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido ao baixar PDF'

        setDownloadError(errorMsg)
        onError?.(errorMsg)

        // Toast de erro
        if (showToast) {
          const { toast } = await import('react-toastify')

          toast.error(`Erro ao baixar boleto: ${errorMsg}`)
        }

        return false
      } finally {
        setIsDownloading(false)
      }
    },
    [isDownloading, onSuccess, onError, showToast, customFilename]
  )

  const clearError = useCallback(() => {
    setDownloadError(null)
  }, [])

  return {
    isDownloading,
    downloadPDF,
    downloadError,
    clearError
  }
}

// const { isDownloading, downloadPDF } = useDownloadPDF({
//   customFilename: `boleto_${invoice?.invoiceNumber}.pdf`,
//   onSuccess: (filename) => console.log('Boleto baixado:', filename),
//   onError: (error) => console.error('Erro download:', error)
// })

// const handleDownloadBoleto = () => {
//   if (invoice?.link) {
//     downloadPDF(invoice.link, `boleto_${invoice.invoiceNumber}.pdf`)
//   }
// }
