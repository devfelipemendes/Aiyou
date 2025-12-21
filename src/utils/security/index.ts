/**
 * Sistema de Segurança e Sanitização de Inputs
 *
 * Protege contra:
 * - XSS (Cross-Site Scripting)
 * - SQL Injection
 * - NoSQL Injection
 * - Path Traversal
 * - Command Injection
 */

// Exportar sanitizadores
export { sanitizeInput } from './sanitizers'
export type { SanitizationConfig } from './config/sanitization-rules'
export {
  DEFAULT_SANITIZATION_CONFIG,
  NUMERIC_FIELD_CONFIG,
  TEXT_FIELD_CONFIG,
  NAME_FIELD_CONFIG
} from './config/sanitization-rules'

// Exportar schemas Valibot
export {
  sanitizedString,
  sanitizedEmail,
  sanitizedPassword,
  sanitizedName,
  numericString,
  sanitizedUrl
} from './valibot-schemas/sanitized-schemas'

// Exportar sanitizadores individuais (para casos especiais)
export {
  sanitizeXSS,
  sanitizeSQLInjection,
  sanitizeNoSQLInjection,
  sanitizePathTraversal,
  sanitizeCommandInjection
} from './sanitizers'
