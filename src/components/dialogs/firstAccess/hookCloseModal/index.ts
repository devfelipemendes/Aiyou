// src/hooks/useFirstAccessCheck.ts
import { useEffect } from 'react'

import { useAppDispatch } from '@/redux-store'
import { setFirstAccess, openModal } from '@/redux-store/slices/firstAccessSlice'
import { useUserMe } from '@/hooks/useUserMe'

// Hook para verificar firstAccess usando o useUserMe existente
export const useFirstAccessCheck = () => {
  const dispatch = useAppDispatch()

  // ✅ Usar o hook existente do projeto
  const { user, isLoading, firstAccess } = useUserMe({ autoFetch: true })

  useEffect(() => {
    // Aguardar carregar os dados do usuário
    if (isLoading) return

    if (user) {
      console.log('👤 Dados do usuário carregados:', user)

      // ✅ Verificar se tem a propriedade firstAccess no user
      const hasFirstAccess = firstAccess !== undefined ? firstAccess : true

      // Atualizar estado do Redux
      dispatch(setFirstAccess(hasFirstAccess))

      // Se for primeiro acesso, abrir o modal automaticamente
      if (hasFirstAccess) {
        console.log('🔓 Primeiro acesso detectado - abrindo modal')
        dispatch(openModal())
      } else {
        console.log('✅ Usuário já completou o primeiro acesso')
      }
    } else if (!isLoading) {
      // Se não tem usuário e não está carregando, assumir primeiro acesso
      console.warn('⚠️ Usuário não encontrado - assumindo primeiro acesso')
      dispatch(setFirstAccess(true))
      dispatch(openModal())
    }
  }, [user, isLoading, dispatch, firstAccess])

  return { user, isLoading }
}
