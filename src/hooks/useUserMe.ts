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
  selectIsAdmin
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
    rawData: data
  }
}

// ==========================================
// 🎯 2. INTEGRAÇÃO COM LOGIN
// ==========================================
// src/hooks/useAuth.ts (exemplo de como integrar)

//import { usePostLoginMutation } from '@/api/endpoints/authUser/login'
//import { useUserMe } from './useUserMe'
//
//export function useAuth() {
//  const [postLogin, { isLoading: isLoggingIn }] = usePostLoginMutation()
//  const { fetchUserData, invalidateUserData } = useUserMe()
//
//  const login = async (credentials: LoginCredentials) => {
//    try {
//      console.log('🔑 Fazendo login...')
//
//      // 1. Fazer login
//      const result = await postLogin(credentials)
//
//      if ('error' in result) {
//        throw new Error('Erro no login')
//      }
//
//      console.log('✅ Login bem-sucedido!')
//
//      // 2. Buscar dados do usuário automaticamente após login
//      console.log('📊 Carregando dados do usuário...')
//      await fetchUserData()
//
//      return result.data
//    } catch (error) {
//      console.error('❌ Erro no login:', error)
//      throw error
//    }
//  }
//
//  const logout = () => {
//    console.log('🚪 Fazendo logout...')
//
//    // 1. Limpar token/localStorage aqui
//    localStorage.removeItem('auth_token')
//
//    // 2. Invalidar cache do usuário
//    invalidateUserData()
//
//    // 3. Redirecionar para login
//    window.location.href = '/login'
//  }
//
//  return {
//    login,
//    logout,
//    isLoggingIn
//  }
//}
//
//// ==========================================
//// 🎯 3. EXEMPLO DE USO EM COMPONENTES
//// ==========================================
//
//// 🔹 Dashboard principal
//function Dashboard() {
//  const {
//    user,
//    plan,
//    tokensUsage,
//    assistantsUsage,
//    isLoading,
//    fetchUserData
//  } = useUserMe()
//
//  if (isLoading) {
//    return <div>Carregando dados do usuário...</div>
//  }
//
//  if (!user) {
//    return <div>Usuário não encontrado</div>
//  }
//
//  return (
//    <div>
//      <h1>Olá, {user.name}!</h1>
//
//      <div>
//        <h2>Plano: {plan?.name}</h2>
//        <p>Tokens: {tokensUsage.toFixed(1)}% usado</p>
//        <p>Assistentes: {assistantsUsage.toFixed(1)}% usado</p>
//      </div>
//
//      <button onClick={() => fetchUserData()}>
//        🔄 Atualizar Dados
//      </button>
//    </div>
//  )
//}
//
//// 🔹 Componente de perfil
//function UserProfile() {
//  const { user, permissions, isAdmin } = useUserMe()
//
//  return (
//    <div>
//      <h2>Perfil do Usuário</h2>
//
//      <p><strong>Nome:</strong> {user?.name}</p>
//      <p><strong>Email:</strong> {user?.email}</p>
//      <p><strong>Cidade:</strong> {user?.city}</p>
//
//      {isAdmin && (
//        <div>
//          <h3>🔑 Permissões de Admin</h3>
//          <ul>
//            {permissions.map(perm => (
//              <li key={perm.name}>
//                <strong>{perm.name}:</strong> {perm.description}
//              </li>
//            ))}
//          </ul>
//        </div>
//      )}
//    </div>
//  )
//}
//
//// 🔹 Componente de projetos do usuário
//function UserProjects() {
//  const { projects } = useUserMe()
//
//  return (
//    <div>
//      <h2>Meus Projetos ({projects.length})</h2>
//
//      {projects.map(project => (
//        <div key={project.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
//          <h3>{project.name}</h3>
//          <p>{project.description}</p>
//          <p>Tokens usados: {project.used_tokens.toLocaleString()}</p>
//          <p>Assistentes: {project.assistants.length}</p>
//
//          {project.assistants.map(assistant => (
//            <div key={assistant.id} style={{ marginLeft: '20px' }}>
//              • {assistant.name}
//            </div>
//          ))}
//        </div>
//      ))}
//    </div>
//  )
//}
//
//// ==========================================
//// 🎯 4. EXEMPLO DE LAYOUT PRINCIPAL
//// ==========================================
//function AppLayout({ children }: { children: React.ReactNode }) {
//  const { user, isLoading } = useUserMe({ autoFetch: true }) // Buscar ao montar
//  const { logout } = useAuth()
//
//  // Exibir loading enquanto carrega dados do usuário
//  if (isLoading) {
//    return (
//      <div style={{ padding: '20px', textAlign: 'center' }}>
//        <h2>Carregando...</h2>
//        <p>Obtendo dados do usuário...</p>
//      </div>
//    )
//  }
//
//  // Se não tem usuário após carregar, redirecionar para login
//  if (!user) {
//    window.location.href = '/login'
//    return null
//  }
//
//  return (
//    <div>
//      {/* Header */}
//      <header style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
//        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//          <h1>AIYou Dashboard</h1>
//          <div>
//            <span>Olá, {user.name}</span>
//            <button onClick={logout} style={{ marginLeft: '10px' }}>
//              Sair
//            </button>
//          </div>
//        </div>
//      </header>
//
//      {/* Content */}
//      <main style={{ padding: '20px' }}>
//        {children}
//      </main>
//    </div>
//  )
//}
//
//// ==========================================
//// 🎯 5. EXEMPLO DE LOGIN PAGE
//// ==========================================
//function LoginPage() {
//  const { login, isLoggingIn } = useAuth()
//  const [email, setEmail] = useState('')
//  const [password, setPassword] = useState('')
//
//  const handleSubmit = async (e: React.FormEvent) => {
//    e.preventDefault()
//
//    try {
//      await login({
//        email,
//        password,
//        device_name: 'Web App'
//      })
//
//      // Login bem-sucedido - dados do usuário já foram carregados
//      window.location.href = '/dashboard'
//    } catch (error) {
//      alert('Erro no login')
//    }
//  }
//
//  return (
//    <form onSubmit={handleSubmit}>
//      <div>
//        <label>Email:</label>
//        <input
//          type="email"
//          value={email}
//          onChange={(e) => setEmail(e.target.value)}
//          required
//        />
//      </div>
//
//      <div>
//        <label>Senha:</label>
//        <input
//          type="password"
//          value={password}
//          onChange={(e) => setPassword(e.target.value)}
//          required
//        />
//      </div>
//
//      <button type="submit" disabled={isLoggingIn}>
//        {isLoggingIn ? 'Entrando...' : 'Entrar'}
//      </button>
//    </form>
//  )
//}
//
