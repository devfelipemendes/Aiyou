// hooks/useAssistantsSync.ts
import { useEffect } from 'react'

import { useAppDispatch, useAppSelector } from '@/redux-store'
import { setAssistants } from '@/redux-store/slices/assistants'
import { useGetAssistantsQuery } from '@/api/endpoints/assistant/assistant'

export function useAssistantsSync() {
  const dispatch = useAppDispatch()

  const { data, isSuccess } = useGetAssistantsQuery(undefined, {
    refetchOnMountOrArgChange: false
  })

  useEffect(() => {
    if (isSuccess && data?.data) {
      dispatch(setAssistants(data.data))
    }
  }, [isSuccess, data, dispatch])

  const assistants = useAppSelector(state => state.assistants.list)

  return assistants
}
