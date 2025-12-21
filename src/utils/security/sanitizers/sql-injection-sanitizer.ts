/**
 * Sanitiza SQL Injection
 * Remove palavras-chave SQL e caracteres perigosos
 */

const SQL_KEYWORDS = [
  'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER',
  'EXEC', 'EXECUTE', 'UNION', 'TRUNCATE', 'GRANT', 'REVOKE'
]

export const sanitizeSQLInjection = (input: string): string => {
  let sanitized = input

  // Remove palavras-chave SQL (case-insensitive)
  const sqlKeywordsRegex = new RegExp(`(\\b(${SQL_KEYWORDS.join('|')})\\b)`, 'gi')

  sanitized = sanitized.replace(sqlKeywordsRegex, '')

  // Remove comentários SQL (-- e multi-linha)
  sanitized = sanitized.replace(/--/g, '')
  sanitized = sanitized.replace(/\/\*/g, '')
  sanitized = sanitized.replace(/\*\//g, '')

  // Remove ponto e vírgula (encerramento de comando)
  sanitized = sanitized.replace(/;/g, '')

  // Remove stored procedures perigosas
  sanitized = sanitized.replace(/xp_/gi, '')
  sanitized = sanitized.replace(/sp_/gi, '')

  return sanitized.trim()
}
