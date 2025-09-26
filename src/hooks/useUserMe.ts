// src/hooks/useUserMe.ts
import { useEffect } from 'react'

import { useAppSelector, useAppDispatch } from '@/redux-store'
import {
  useGetMeQuery,
  selectUser,
  selectUserPermissions,
  selectUserProjects,
  selectUserPlan,
  selectTokensUsagePercentage,
  selectAssistantsUsagePercentage,
  selectIsAdmin,
  selectFirstAccess,
  selectUserPlanId,
  selectTokensUsage
} from '@/api/endpoints/authUser/me'
import { apiSlice } from '@/api/ApiCreate/apiSlice'

interface UseUserMeOptions {
  autoFetch?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}

export function useUserMe(options: UseUserMeOptions = {}) {
  const { autoFetch = false, onSuccess, onError } = options
  const dispatch = useAppDispatch()

  // 🔧 CORREÇÃO: Sempre inicializar, mas com refetch condicional
  const { data, isLoading, error, refetch } = useGetMeQuery(undefined, {
    skip: false, // ✅ Sempre inicializar
    refetchOnMountOrArgChange: autoFetch // ✅ Só buscar se autoFetch = true
  })

  const user = useAppSelector(selectUser)
  const permissions = useAppSelector(selectUserPermissions)
  const projects = useAppSelector(selectUserProjects)
  const plan = useAppSelector(selectUserPlan)
  const tokensUsage = useAppSelector(selectTokensUsagePercentage)
  const assistantsUsage = useAppSelector(selectAssistantsUsagePercentage)
  const isAdmin = useAppSelector(selectIsAdmin)
  const firstAccess = useAppSelector(selectFirstAccess)
  const userPlanId = useAppSelector(selectUserPlanId)
  const userTokensUsage = useAppSelector(selectTokensUsage)

  useEffect(() => {
    if (data && onSuccess) {
      onSuccess(data)
    }
  }, [data, onSuccess])

  useEffect(() => {
    if (error && onError) {
      onError(error)
    }
  }, [error, onError])

  // ✅ Agora o refetch sempre funcionará
  const fetchUserData = () => {
    console.log('🔄 Buscando dados do usuário...')

    return refetch()
  }

  const invalidateUserData = () => {
    console.log('🗑️ Invalidando cache do usuário...')
    dispatch(apiSlice.util.invalidateTags(['User']))
  }

  return {
    user,
    permissions,
    projects,
    plan,
    tokensUsage,
    assistantsUsage,
    isAdmin,
    isLoading,
    error,
    fetchUserData,
    invalidateUserData,
    rawData: data,
    firstAccess,
    userPlanId,
    userTokensUsage
  }
}
