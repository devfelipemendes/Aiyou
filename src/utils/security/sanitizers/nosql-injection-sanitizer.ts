/**
 * Sanitiza NoSQL Injection (MongoDB)
 * Remove operadores e tenta detectar JSON malicioso
 */

export const sanitizeNoSQLInjection = (input: string): string => {
  let sanitized = input

  // Remove operadores MongoDB
  const nosqlOperators = /\$\w+/g  // $where, $ne, $gt, etc

  sanitized = sanitized.replace(nosqlOperators, '')

  // Remove caracteres perigosos
  sanitized = sanitized.replace(/[{}$]/g, '')

  // Detecta tentativa de injeção de objeto JSON
  if (input.trim().startsWith('{') || input.trim().startsWith('[')) {
    try {
      JSON.parse(input)

      // Se conseguiu parsear, é JSON - rejeitar completamente
      console.warn('[SECURITY] Tentativa de injeção JSON detectada')

      return ''
    } catch {
      // Não é JSON válido, prosseguir com sanitização
    }
  }

  return sanitized.trim()
}
