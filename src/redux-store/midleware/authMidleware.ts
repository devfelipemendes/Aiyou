// redux-store/middleware/authMiddleware.ts
import type { Middleware, MiddlewareAPI } from '@reduxjs/toolkit'

import { loginSuccess, logout, setCredentials } from '../slices/auth'
import type { AppDispatch, RootState } from '..'

export const authMiddlewareFunc: Middleware<
  {},
  RootState,
  AppDispatch
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
> = (store: MiddlewareAPI<AppDispatch, RootState>) => next => action => {
  const isTokenAction =
    (setCredentials.match(action) || loginSuccess.match(action)) &&
    action.payload &&
    typeof (action.payload as { token?: string }).token === 'string'

  if (isTokenAction) {
    localStorage.setItem('authToken', (action.payload as { token: string }).token)
  }

  if (logout.match(action)) {
    localStorage.removeItem('authToken')
  }

  return next(action)
}

// Interface para payloads que podem conter datas
interface DatePayload {
  time?: Date | string | unknown
  createdAt?: Date | string | unknown
  updatedAt?: Date | string | unknown
  [key: string]: unknown
}

// Função helper para verificar se é uma Date
const isDate = (value: unknown): value is Date => {
  return value instanceof Date && !isNaN(value.getTime())
}

// Função recursiva para converter todas as Dates em um objeto
const convertDatesInObject = (obj: unknown): unknown => {
  if (isDate(obj)) {
    return obj.toISOString()
  }

  if (Array.isArray(obj)) {
    return obj.map(convertDatesInObject)
  }

  if (obj !== null && typeof obj === 'object') {
    const converted: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(obj)) {
      converted[key] = convertDatesInObject(value)
    }

    return converted
  }

  return obj
}

// Middleware tipado corretamente
export const dateMiddleware: Middleware<
  {}, // Não há dispatch específico
  RootState,
  AppDispatch
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
> = store => next => (action: unknown) => {
  // Type guard para verificar se a action tem payload
  if (
    typeof action === 'object' &&
    action !== null &&
    'payload' in action &&
    typeof (action as { payload: unknown }).payload === 'object' &&
    (action as { payload: unknown }).payload !== null
  ) {
    const convertedPayload = convertDatesInObject((action as { payload: unknown }).payload)

    // Se houve conversão, crie uma nova action
    if (convertedPayload !== (action as { payload: unknown }).payload) {
      const convertedAction = {
        ...(action as object),
        payload: convertedPayload
      }

      return next(convertedAction)
    }
  }

  return next(action)
}

export const specificDateMiddleware: Middleware<{}, RootState, AppDispatch> =
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  store => next => (action: unknown) => {
    if (
      typeof action === 'object' &&
      action !== null &&
      'payload' in action &&
      typeof (action as { payload: unknown }).payload === 'object'
    ) {
      const payload = { ...(action as { payload: DatePayload }).payload }
      let hasChanges = false

      // Lista de campos que podem conter datas
      const dateFields: (keyof DatePayload)[] = ['time', 'createdAt', 'updatedAt']

      dateFields.forEach(field => {
        if (payload[field] && isDate(payload[field])) {
          payload[field] = (payload[field] as Date).toISOString()
          hasChanges = true
        }
      })

      if (hasChanges) {
        return next({
          ...(action as object),
          payload
        })
      }
    }

    return next(action)
  }
