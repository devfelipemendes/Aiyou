import React, { useState, useRef, useEffect } from 'react'

import { Edit, Trash2, Upload, Plus } from 'lucide-react'

interface ImageDropzoneProps {
  initialImage?: string | null

  /** Callback chamado quando a imagem muda */
  /** Callback chamado quando a imagem muda */
  onImageChange?: (image: File | null, imageUrl: string | null) => void

  /** Tamanho do componente */
  size?: 'sm' | 'md' | 'lg' | 'xl'

  /** Se o componente está desabilitado */
  disabled?: boolean

  /** Texto personalizado para o estado vazio */
  placeholder?: string

  /** Tipos de arquivo aceitos */
  acceptedTypes?: string[]

  /** Tamanho máximo do arquivo em MB */
  maxSizeMB?: number

  /** Classe CSS adicional */
  className?: string
}

export default function ImageDropzone({
  initialImage = null,
  onImageChange,
  size = 'md',
  disabled = false,
  placeholder = 'Adicionar imagem',
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxSizeMB = 5,
  className = ''
}: ImageDropzoneProps) {
  const [image, setImage] = useState<string | null>(initialImage)
  const [isDragging, setIsDragging] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sincronizar com prop externa
  useEffect(() => {
    setImage(initialImage)
  }, [initialImage])

  // Tamanhos disponíveis
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-40 h-40',
    xl: 'w-48 h-48'
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()

    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (disabled) return

    const files = e.dataTransfer.files

    if (files.length > 0) {
      handleFileSelection(files[0])
    }
  }

  const validateFile = (file: File): string | null => {
    // Verificar tipo
    if (!acceptedTypes.includes(file.type)) {
      return `Tipo de arquivo não suportado. Aceitos: ${acceptedTypes
        .map(type => type.split('/')[1].toUpperCase())
        .join(', ')}`
    }

    // Verificar tamanho
    const fileSizeMB = file.size / (1024 * 1024)

    if (fileSizeMB > maxSizeMB) {
      return `Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`
    }

    return null
  }

  const handleFileSelection = (file: File) => {
    setError(null)

    const validationError = validateFile(file)

    if (validationError) {
      setError(validationError)

      return
    }

    const reader = new FileReader()

    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target?.result) {
        const imageUrl = e.target.result as string

        setImage(imageUrl)

        // Notificar componente pai
        onImageChange?.(file, imageUrl)
      }
    }

    reader.readAsDataURL(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (file) {
      handleFileSelection(file)
    }
  }

  const handleEdit = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  const handleDelete = () => {
    if (!disabled) {
      setImage(null)
      setError(null)

      // Notificar componente pai
      onImageChange?.(null, null)

      // Limpar input file
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleClick = () => {
    if (!image && !disabled) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Input file oculto */}
      <input
        ref={fileInputRef}
        type='file'
        accept={acceptedTypes.join(',')}
        onChange={handleFileInputChange}
        className='hidden'
        disabled={disabled}
      />

      {/* Container principal da imagem/dropzone */}
      <div
        className={`
          relative ${sizeClasses[size]} rounded-full p-1
          bg-gradient-to-br from-[#028175] via-[#02fc6a] to-[#0a1202]
          transition-all duration-300 ease-in-out
          ${!disabled ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
          ${isDragging ? 'scale-105 animate-pulse bg-gradient-to-tl' : ''}
          ${!disabled ? 'hover:shadow-lg hover:shadow-green-500/25 hover:from-[#02fc6a] hover:via-[#028175] hover:to-[#0a1202]' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        onMouseEnter={() => !disabled && setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Área interna da imagem */}
        <div className='w-full h-full rounded-full overflow-hidden bg-zinc-100 relative flex items-center justify-center'>
          {image ? (
            <>
              {/* Imagem */}
              <img src={image} alt='Preview' className='w-full h-full object-cover' />

              {/* Overlay com botões ao hoverar */}
              {isHovering && !disabled && (
                <div className='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center gap-2 transition-opacity duration-200'>
                  <button
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation()
                      handleEdit()
                    }}
                    className='p-2 bg-white rounded-full hover:bg-gray-100 transition-colors duration-200'
                    title='Editar imagem'
                  >
                    <Edit size={16} className='text-gray-700' />
                  </button>
                  <button
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation()
                      handleDelete()
                    }}
                    className='p-2 bg-white rounded-full hover:bg-gray-100 transition-colors duration-200'
                    title='Deletar imagem'
                  >
                    <Trash2 size={16} className='text-red-600' />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div
              className={`
              w-full h-full flex flex-col items-center justify-center
              rounded-full transition-all duration-200
              ${isDragging ? 'bg-green-50 text-green-600' : 'hover:bg-gray-50 text-gray-400'}
            `}
            >
              <div className='text-center'>
                {isDragging ? (
                  <Upload size={size === 'sm' ? 20 : size === 'md' ? 24 : 32} className='text-green-600 mx-auto mb-1' />
                ) : (
                  <Plus size={size === 'sm' ? 20 : size === 'md' ? 24 : 32} className='text-gray-400 mx-auto mb-1' />
                )}
                <p
                  className={`${size === 'sm' ? 'text-xs' : 'text-sm'} font-medium ${isDragging ? 'text-green-600' : 'text-gray-600'}`}
                >
                  {isDragging ? 'Solte aqui' : size === 'sm' ? 'Add' : placeholder}
                </p>
                {size !== 'sm' && <p className='text-xs text-gray-400 mt-1'>{isDragging ? '' : 'Clique ou arraste'}</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mensagem de erro */}
      {error && <p className='text-red-500 text-xs mt-2 text-center max-w-xs'>{error}</p>}

      {/* Informações */}
      {!error && !image && (
        <div className='text-center mt-2'>
          <p className='text-xs text-gray-400'>
            {acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')} • Máx {maxSizeMB}MB
          </p>
        </div>
      )}
    </div>
  )
}

// Exemplo de uso em um componente pai
export function ExampleUsage() {
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleImageChange = (file: File | null, imageUrl: string | null) => {
    setCurrentFile(file)
    setImagePreview(imageUrl)
    console.log('Nova imagem:', file)
    console.log('URL da imagem:', imageUrl)
  }

  const handleSubmit = async () => {
    if (currentFile) {
      const formData = new FormData()

      formData.append('image', currentFile)

      // Enviar para endpoint
      // await fetch('/api/upload', { method: 'POST', body: formData });
      console.log('Enviando imagem:', currentFile)
    }
  }

  return (
    <div className='p-8 space-y-6'>
      <h2 className='text-xl font-bold'>Cadastro de Projeto AIYOU</h2>

      {/* Componente de upload */}
      <ImageDropzone onImageChange={handleImageChange} size='lg' placeholder='Imagem do projeto' maxSizeMB={10} />

      {/* Outros campos do formulário */}
      <div className='space-y-4'>
        <input type='text' placeholder='Nome do projeto' className='w-full p-3 border rounded-lg' />

        <button
          onClick={handleSubmit}
          disabled={!currentFile}
          className='bg-gradient-to-r from-[#028175] to-[#02fc6a] text-white px-6 py-3 rounded-lg disabled:opacity-50'
        >
          Salvar Projeto
        </button>
      </div>

      {/* Debug info */}
      {imagePreview && (
        <div className='text-sm text-gray-500'>
          <p>Arquivo: {currentFile?.name}</p>
          <p>Tamanho: {(currentFile?.size || 0 / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      )}
    </div>
  )
}
