/**
 * Sanitiza Command Injection
 * Bloqueia caracteres de shell e comandos perigosos
 */

const DANGEROUS_COMMANDS = [
  'rm', 'del', 'format', 'curl', 'wget', 'bash', 'sh', 'cmd',
  'eval', 'exec', 'system', 'chmod', 'chown', 'kill', 'shutdown'
]

export const sanitizeCommandInjection = (input: string): string => {
  let sanitized = input

  // Remove caracteres de shell
  const shellChars = /[;|&$`<>]/g

  sanitized = sanitized.replace(shellChars, '')

  // Remove backticks (command substitution)
  sanitized = sanitized.replace(/`/g, '')

  // Remove $(...) (command substitution)
  sanitized = sanitized.replace(/\$\(/g, '')

  // Remove comandos perigosos
  const dangerousCommandsRegex = new RegExp(`\\b(${DANGEROUS_COMMANDS.join('|')})\\b`, 'gi')

  sanitized = sanitized.replace(dangerousCommandsRegex, '')

  // Remove redirecionamentos
  sanitized = sanitized.replace(/>/g, '')
  sanitized = sanitized.replace(/</g, '')

  return sanitized.trim()
}
