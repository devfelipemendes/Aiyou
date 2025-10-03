// file: src/hooks/usePlanPolling.ts
import { useAppDispatch, useAppSelector } from '@/redux-store'
import { startPolling, stopPolling, selectIsPolling, selectPollingAttempts } from '@/redux-store/slices/pollingMeSlice'

export function usePlanPolling() {
  const dispatch = useAppDispatch()
  const isPolling = useAppSelector(selectIsPolling)
  const attempts = useAppSelector(selectPollingAttempts)

  const startPlanPolling = () => {
    console.log('🎬 Iniciando verificação de pagamento')
    dispatch(startPolling())
  }

  const stopPlanPolling = () => {
    console.log('🛑 Parando verificação de pagamento')
    dispatch(stopPolling())
  }

  return {
    isPolling,
    attempts,
    startPlanPolling,
    stopPlanPolling
  }
}
