// src/hooks/useFirstAccessCheck.ts
import { useEffect } from 'react'

import Cookies from 'js-cookie'

import { useAppDispatch } from '@/redux-store'
import { setFirstAccess, openModal } from '@/redux-store/slices/firstAccessSlice'
import { useUserMe } from '@/hooks/useUserMe'

export const useFirstAccessCheck = () => {
  const dispatch = useAppDispatch()

  // ✅ Verificar se tem token antes de fazer a query
  const hasToken = !!Cookies.get('token')

  // ✅ Só busca dados se tiver token
  const { user, isLoading } = useUserMe({
    autoFetch: hasToken
  })

  useEffect(() => {
    // ✅ Só executa se tiver token
    if (!hasToken) {
      console.log('❌ Sem token - não verificando firstAccess')

      return
    }

    console.log('🔄 useFirstAccessCheck - user:', user, 'isLoading:', isLoading)

    if (isLoading) return

    if (user) {
      // ✅ TEMPORÁRIO: sempre true para testar
      // Depois trocar por: user.firstAccess ou user.first_access
      const hasFirstAccess = true // 🧪 TESTE

      console.log('👤 Usuário carregado. FirstAccess:', hasFirstAccess)

      dispatch(setFirstAccess(hasFirstAccess))

      if (hasFirstAccess) {
        console.log('🔓 Abrindo modal de primeiro acesso')
        dispatch(openModal())
      }
    } else if (!isLoading) {
      console.warn('⚠️ Usuário não encontrado mas tem token')
      dispatch(setFirstAccess(true))
      dispatch(openModal())
    }
  }, [user, isLoading, dispatch, hasToken])

  return { user, isLoading, hasToken }
}
