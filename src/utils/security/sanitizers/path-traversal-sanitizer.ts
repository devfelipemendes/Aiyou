/**
 * Sanitiza Path Traversal
 * Remove ../, caminhos absolutos, permite apenas nomes simples
 */

export const sanitizePathTraversal = (input: string): string => {
  let sanitized = input

  // Remove padrões de traversal
  const traversalPatterns = [
    /\.\.\//g,      // ../
    /\.\.\\/g,      // ..\
    /\.\//g,        // ./
    /\.\\/g,        // .\
    /^[A-Za-z]:\\/g, // C:\
    /^\//g,         // /
    /^\\/g          // \
  ]

  traversalPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '')
  })

  // Remove URL encoding de caracteres perigosos
  sanitized = sanitized.replace(/%2e%2e/gi, '')
  sanitized = sanitized.replace(/%2f/gi, '')
  sanitized = sanitized.replace(/%5c/gi, '')

  // Permite apenas alfanuméricos, acentos, hífen, underscore, ponto
  sanitized = sanitized.replace(/[^a-zA-Z0-9À-ÿ._-]/g, '')

  return sanitized.trim()
}
