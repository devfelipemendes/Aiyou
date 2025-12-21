import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitiza XSS removendo TODO HTML
 * Preserva texto e emojis (Unicode)
 */
export const sanitizeXSS = (input: string): string => {
  const config = {
    ALLOWED_TAGS: [],      // Nenhuma tag HTML permitida
    ALLOWED_ATTR: [],      // Nenhum atributo permitido
    KEEP_CONTENT: true,    // Preserva conteúdo de texto
    ALLOW_DATA_ATTR: false,
    SAFE_FOR_TEMPLATES: true
  }

  return DOMPurify.sanitize(input, config)
}
