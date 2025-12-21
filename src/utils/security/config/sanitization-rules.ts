/**
 * Configurações de sanitização
 */

export interface SanitizationConfig {
  xss?: boolean
  sql?: boolean
  nosql?: boolean
  path?: boolean
  command?: boolean
}

// Configuração padrão - TODAS as proteções
export const DEFAULT_SANITIZATION_CONFIG: SanitizationConfig = {
  xss: true,
  sql: true,
  nosql: true,
  path: true,
  command: true
}

// Para campos numéricos com máscara (CPF, telefone, CEP)
export const NUMERIC_FIELD_CONFIG: SanitizationConfig = {
  xss: true,
  sql: false,
  nosql: false,
  path: false,
  command: false
}

// Para campos de texto simples (chat, mensagens)
export const TEXT_FIELD_CONFIG: SanitizationConfig = {
  xss: true,
  sql: true,
  nosql: true,
  path: false,
  command: false
}

// Para campos de nome (apenas XSS + SQL)
export const NAME_FIELD_CONFIG: SanitizationConfig = {
  xss: true,
  sql: true,
  nosql: false,
  path: false,
  command: false
}
