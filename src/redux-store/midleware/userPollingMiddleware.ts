// file: src/redux-store/middleware/userPollingMiddleware.ts
import type { Middleware, AnyAction, ThunkDispatch } from '@reduxjs/toolkit'

import { startPolling, stopPolling, incrementAttempt, setIntervalId } from '../slices/pollingMeSlice'
import { userMeApi, type GetMeResponse } from '@/api/endpoints/authUser/me'
import type { RootState } from '@/redux-store'

let pollingIntervalRef: NodeJS.Timeout | null = null

const userPollingMiddleware: Middleware = store => next => action => {
  const result = next(action)

  // Type guard para garantir que action é AnyAction
  if (!action || typeof action !== 'object' || !('type' in action)) {
    return result
  }

  const typedAction = action as AnyAction

  if (startPolling.match(typedAction)) {
    const state = store.getState() as RootState
    const pollingInterval = state.planPolling.pollingInterval
    const maxAttempts = state.planPolling.maxAttempts

    console.log('🚀 Iniciando polling a cada', pollingInterval / 1000, 'segundos')

    if (pollingIntervalRef) clearInterval(pollingIntervalRef)

    // Cast do dispatch para incluir thunks
    const dispatch = store.dispatch as ThunkDispatch<RootState, any, AnyAction>

    dispatch(userMeApi.endpoints.getMe.initiate(undefined, { forceRefetch: true }))

    pollingIntervalRef = setInterval(() => {
      const currentState = store.getState() as RootState
      const { attempts, isPolling } = currentState.planPolling

      if (!isPolling) {
        console.log('⏹️ Polling interrompido')
        if (pollingIntervalRef) clearInterval(pollingIntervalRef)

        return
      }

      if (attempts >= maxAttempts) {
        console.log('⏱️ Máximo de tentativas atingido')
        store.dispatch(stopPolling())
        if (pollingIntervalRef) clearInterval(pollingIntervalRef)

        return
      }

      console.log(`🔄 Tentativa ${attempts + 1}/${maxAttempts}`)
      store.dispatch(incrementAttempt())
      dispatch(userMeApi.endpoints.getMe.initiate(undefined, { forceRefetch: true }))
    }, pollingInterval)

    store.dispatch(setIntervalId(pollingIntervalRef as any))
  }

  if (stopPolling.match(typedAction)) {
    if (pollingIntervalRef) {
      clearInterval(pollingIntervalRef)
      pollingIntervalRef = null
    }
  }

  // Type guard para ação do RTK Query
  if (
    typedAction.type === 'api/executeQuery/fulfilled' &&
    'meta' in typedAction &&
    typeof typedAction.meta === 'object' &&
    typedAction.meta !== null &&
    'arg' in typedAction.meta &&
    typeof typedAction.meta.arg === 'object' &&
    typedAction.meta.arg !== null &&
    'endpointName' in typedAction.meta.arg &&
    typedAction.meta.arg.endpointName === 'getMe'
  ) {
    const state = store.getState() as RootState

    if (state.planPolling.isPolling) {
      const response = typedAction.payload as GetMeResponse
      const planOrder = response?.data?.user_plan_id

      console.log('📊 /me recebido:', { user_plan_id: planOrder })

      if (planOrder === null || planOrder === undefined) {
        console.log('✅ Pagamento confirmado!')
        store.dispatch(stopPolling())
      }
    }
  }

  return result
}

export default userPollingMiddleware
