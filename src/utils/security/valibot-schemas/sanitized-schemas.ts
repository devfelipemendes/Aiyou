import * as v from 'valibot'

import { sanitizeInput, sanitizeXSS } from '../sanitizers'
import { NAME_FIELD_CONFIG } from '../config/sanitization-rules'

/**
 * Schema para string sanitizada (todas as proteções)
 */
export const sanitizedString = (errorMsg?: string) =>
  v.pipe(
    v.string(errorMsg || 'Campo é obrigatório'),
    v.transform(input => sanitizeInput(input)),
    v.nonEmpty('Campo não pode ser vazio')
  )

/**
 * Schema para email sanitizado
 */
export const sanitizedEmail = () =>
  v.pipe(
    v.string('Email é obrigatório'),
    v.transform(input => sanitizeInput(input, { xss: true, sql: true, nosql: false, path: false, command: false })),
    v.nonEmpty('Email é obrigatório'),
    v.email('Email inválido')
  )

/**
 * Schema para senha sanitizada
 */
export const sanitizedPassword = (minLength: number = 6, errorMsg?: string) =>
  v.pipe(
    v.string(errorMsg || 'Senha é obrigatória'),
    v.transform(input => sanitizeInput(input, { xss: true, sql: true, nosql: true, path: false, command: false })),
    v.nonEmpty('Senha é obrigatória'),
    v.minLength(minLength, `Senha deve ter pelo menos ${minLength} caracteres`)
  )

/**
 * Schema para nome sanitizado (XSS + SQL apenas)
 */
export const sanitizedName = (errorMsg?: string) =>
  v.pipe(
    v.string(errorMsg || 'Nome é obrigatório'),
    v.transform(input => sanitizeInput(input, NAME_FIELD_CONFIG)),
    v.nonEmpty('Nome não pode ser vazio'),
    v.minLength(2, 'Nome deve ter pelo menos 2 caracteres')
  )

/**
 * Schema para string numérica (apenas XSS - preserva números para máscaras)
 */
export const numericString = (errorMsg?: string) =>
  v.pipe(
    v.string(errorMsg || 'Campo é obrigatório'),
    v.transform(input => sanitizeXSS(input)),
    v.nonEmpty('Campo não pode ser vazio')
  )

/**
 * Schema para URL sanitizada
 */
export const sanitizedUrl = (errorMsg?: string) =>
  v.pipe(
    v.string(errorMsg || 'URL é obrigatória'),
    v.transform(input => sanitizeInput(input, { xss: true, sql: true, nosql: false, path: true, command: true })),
    v.url('Deve ser uma URL válida')
  )
