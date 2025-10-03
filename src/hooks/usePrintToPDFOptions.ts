// file: src/hooks/usePrintToPDF.ts
import { useState, useCallback } from 'react'

interface UsePrintToPDFOptions {
  filename?: string
  onSuccess?: (filename: string) => void
  onError?: (error: string) => void
  showToast?: boolean
  quality?: number
  format?: 'a4' | 'letter'
  orientation?: 'portrait' | 'landscape'
}

interface UsePrintToPDFReturn {
  isGenerating: boolean
  generatePDF: (elementId?: string) => Promise<boolean>
  printError: string | null
}

export const usePrintToPDF = (options: UsePrintToPDFOptions = {}): UsePrintToPDFReturn => {
  const {
    filename = 'fatura.pdf',
    onSuccess,
    onError,
    showToast = true,
    quality = 1,
    format = 'a4',
    orientation = 'portrait'
  } = options

  const [isGenerating, setIsGenerating] = useState(false)
  const [printError, setPrintError] = useState<string | null>(null)

  const generatePDF = useCallback(
    async (elementId = 'previewCard'): Promise<boolean> => {
      if (isGenerating) return false

      setIsGenerating(true)
      setPrintError(null)

      try {
        const [html2canvas, jsPDF] = await Promise.all([import('html2canvas'), import('jspdf')])

        const element = elementId.startsWith('#')
          ? document.querySelector(elementId)
          : document.getElementById(elementId)

        if (!element) {
          throw new Error(`Elemento não encontrado: ${elementId}`)
        }

        // Configurações aprimoradas do html2canvas
        const canvas = await html2canvas.default(element as HTMLElement, {
          scale: 2, // Maior resolução
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          removeContainer: true,
          imageTimeout: 15000,
          logging: false,
          width: element.scrollWidth,
          height: element.scrollHeight,
          scrollX: 0,
          scrollY: 0
        })

        const imgData = canvas.toDataURL('image/png', 1.0) // Máxima qualidade

        const pdf = new jsPDF.jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        })

        // Dimensões A4 em mm
        const pdfWidth = 210
        const pdfHeight = 297
        const margin = 10

        // Calcula dimensões mantendo proporção
        const availableWidth = pdfWidth - margin * 2
        const availableHeight = pdfHeight - margin * 2

        const imgWidth = canvas.width
        const imgHeight = canvas.height
        const ratio = Math.min(availableWidth / (imgWidth * 0.75), availableHeight / (imgHeight * 0.75))

        const finalWidth = imgWidth * 0.75 * ratio
        const finalHeight = imgHeight * 0.75 * ratio

        // Centraliza
        const x = (pdfWidth - finalWidth) / 2
        const y = margin

        pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight, '', 'FAST')

        const finalFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`

        pdf.save(finalFilename)

        if (showToast) {
          const { toast } = await import('react-toastify')

          toast.success(`Fatura salva: ${finalFilename}`)
        }

        onSuccess?.(finalFilename)

        return true
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Erro ao gerar PDF'

        setPrintError(errorMsg)
        onError?.(errorMsg)

        if (showToast) {
          const { toast } = await import('react-toastify')

          toast.error(`Erro ao gerar PDF: ${errorMsg}`)
        }

        return false
      } finally {
        setIsGenerating(false)
      }
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isGenerating, filename, quality, format, orientation, onSuccess, onError, showToast]
  )

  return {
    isGenerating,
    generatePDF,
    printError
  }
}
