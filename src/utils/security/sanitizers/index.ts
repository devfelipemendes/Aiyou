import { sanitizeXSS } from './xss-sanitizer'
import { sanitizeSQLInjection } from './sql-injection-sanitizer'
import { sanitizeNoSQLInjection } from './nosql-injection-sanitizer'
import { sanitizePathTraversal } from './path-traversal-sanitizer'
import { sanitizeCommandInjection } from './command-injection-sanitizer'
import { DEFAULT_SANITIZATION_CONFIG, type SanitizationConfig } from '../config/sanitization-rules'

/**
 * Sanitizador universal que combina todas as proteções
 */
export const sanitizeInput = (
  input: string,
  config: SanitizationConfig = DEFAULT_SANITIZATION_CONFIG
): string => {
  if (!input || typeof input !== 'string') return ''

  let sanitized = input

  // Aplicar sanitizações na ordem correta
  if (config.xss) {
    sanitized = sanitizeXSS(sanitized)
  }

  if (config.sql) {
    sanitized = sanitizeSQLInjection(sanitized)
  }

  if (config.nosql) {
    sanitized = sanitizeNoSQLInjection(sanitized)
  }

  if (config.path) {
    sanitized = sanitizePathTraversal(sanitized)
  }

  if (config.command) {
    sanitized = sanitizeCommandInjection(sanitized)
  }

  return sanitized
}

// Re-exportar sanitizadores individuais
export { sanitizeXSS } from './xss-sanitizer'
export { sanitizeSQLInjection } from './sql-injection-sanitizer'
export { sanitizeNoSQLInjection } from './nosql-injection-sanitizer'
export { sanitizePathTraversal } from './path-traversal-sanitizer'
export { sanitizeCommandInjection } from './command-injection-sanitizer'
