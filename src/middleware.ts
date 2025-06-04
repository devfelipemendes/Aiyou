// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ROUTE_CONFIG = {
  PUBLIC_ROUTES: ['/'],

  AUTH_ROUTES: ['/login'],

  REGISTRATION_ROUTES: ['/register'],

  PROTECTED_ROUTES: ['/painel', '/dashboard', '/profile', '/chat', '/settings'],

  API_ROUTES: ['/api'],

  ADMIN_ROUTES: ['/admin']
}

// Constantes
const AUTH_COOKIE_NAME = 'token'
const LOGIN_ROUTE = '/login'
const DASHBOARD_ROUTE = '/painel'

// Função helper para verificar tipo de rota
const getRouteType = (pathname: string): keyof typeof ROUTE_CONFIG | null => {
  for (const [routeType, routes] of Object.entries(ROUTE_CONFIG)) {
    if (routes.some(route => pathname.startsWith(route))) {
      return routeType as keyof typeof ROUTE_CONFIG
    }
  }

  return null
}

// Função para extrair token
const extractToken = (request: NextRequest): string | null => {
  const cookieToken = request.cookies.get(AUTH_COOKIE_NAME)?.value

  if (cookieToken) {
    return cookieToken
  }

  const authHeader = request.headers.get('Authorization')

  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.split('Bearer ')[1]
  }

  return null
}

const createApiErrorResponse = (message: string, status: number = 401) => {
  return new NextResponse(
    JSON.stringify({
      success: false,
      message,
      timestamp: new Date().toISOString()
    }),
    {
      status,
      headers: { 'content-type': 'application/json' }
    }
  )
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const routeType = getRouteType(pathname)
  const authToken = extractToken(request)

  console.log(`🔍 Middleware - Rota: ${pathname}, Tipo: ${routeType}, Token: ${authToken ? '✅' : '❌'}`)

  if (routeType === 'API_ROUTES') {
    // APIs públicas (como login, register)
    const publicApiRoutes = ['/api/login', '/api/register', '/api/health']
    const isPublicApi = publicApiRoutes.some(route => pathname.startsWith(route))

    if (!isPublicApi && !authToken) {
      console.log('❌ API protegida sem token')

      return createApiErrorResponse('Token de autenticação necessário')
    }

    // Para APIs protegidas, adiciona token aos headers
    if (authToken) {
      const requestHeaders = new Headers(request.headers)

      if (!requestHeaders.has('Authorization')) {
        requestHeaders.set('Authorization', `Bearer ${authToken}`)
      }

      return NextResponse.next({
        request: { headers: requestHeaders }
      })
    }

    return NextResponse.next()
  }

  // ==========================================
  // 2. ROTAS ADMINISTRATIVAS
  // ==========================================
  if (routeType === 'ADMIN_ROUTES') {
    if (!authToken) {
      console.log('❌ Rota admin sem token - redirecionando para login')

      return NextResponse.redirect(new URL(LOGIN_ROUTE, request.url))
    }

    // Aqui você pode adicionar validação de role de admin
    // const userRole = await validateAdminToken(authToken)
    // if (userRole !== 'admin') { ... }

    return NextResponse.next()
  }

  // ==========================================
  // 3. ROTAS PÚBLICAS
  // ==========================================
  if (routeType === 'PUBLIC_ROUTES') {
    console.log('✅ Rota pública - acesso liberado')

    return NextResponse.next()
  }

  // ==========================================
  // 4. ROTAS DE AUTENTICAÇÃO (/login)
  // ==========================================
  if (routeType === 'AUTH_ROUTES') {
    if (authToken) {
      console.log('🔄 Usuário já logado tentando acessar login - redirecionando')

      return NextResponse.redirect(new URL(DASHBOARD_ROUTE, request.url))
    }

    console.log('✅ Acesso ao login liberado')

    return NextResponse.next()
  }

  // ==========================================
  // 5. ROTAS DE REGISTRO/BILLING (/register)
  // ==========================================
  if (routeType === 'REGISTRATION_ROUTES') {
    console.log('✅ Rota de registro - acesso liberado (com ou sem token)')

    // Permite acesso mesmo com token (usuário pode estar no meio do processo)
    // Mas adiciona token aos headers se disponível para APIs internas
    if (authToken) {
      const requestHeaders = new Headers(request.headers)

      if (!requestHeaders.has('Authorization')) {
        requestHeaders.set('Authorization', `Bearer ${authToken}`)
      }

      return NextResponse.next({
        request: { headers: requestHeaders }
      })
    }

    return NextResponse.next()
  }

  // ==========================================
  // 6. ROTAS PROTEGIDAS (/home, /dashboard, etc)
  // ==========================================
  if (routeType === 'PROTECTED_ROUTES') {
    if (!authToken) {
      console.log('❌ Rota protegida sem token - redirecionando para login')
      const loginUrl = new URL(LOGIN_ROUTE, request.url)

      loginUrl.searchParams.set('from', pathname) // Para redirecionar após login

      return NextResponse.redirect(loginUrl)
    }

    console.log('✅ Acesso à rota protegida liberado')

    // Adiciona token aos headers para APIs internas
    const requestHeaders = new Headers(request.headers)

    if (!requestHeaders.has('Authorization')) {
      requestHeaders.set('Authorization', `Bearer ${authToken}`)
    }

    return NextResponse.next({
      request: { headers: requestHeaders }
    })
  }

  // ==========================================
  // 7. ROTAS NÃO CATEGORIZADAS
  // ==========================================
  console.log(`⚠️ Rota não categorizada: ${pathname}`)

  // Para rotas não categorizadas, aplica proteção padrão
  if (!authToken) {
    console.log('❌ Rota não categorizada sem token - redirecionando para login')
    const loginUrl = new URL(LOGIN_ROUTE, request.url)

    loginUrl.searchParams.set('from', pathname)

    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// Configuração do matcher - define quais rotas o middleware vai interceptar
export const config = {
  matcher: [
    /*
     * Intercepta todas as rotas exceto:
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagens)
     * - favicon.ico (favicon)
     * - Arquivos com extensão (css, js, png, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'
  ]
}

// ==========================================
// EXTRAS: Funções auxiliares para uso em outros lugares
// ==========================================

// Para usar em componentes
export const isPublicRoute = (pathname: string): boolean => {
  return ROUTE_CONFIG.PUBLIC_ROUTES.some(route => pathname.startsWith(route))
}

export const isAuthRoute = (pathname: string): boolean => {
  return ROUTE_CONFIG.AUTH_ROUTES.some(route => pathname.startsWith(route))
}

export const isRegistrationRoute = (pathname: string): boolean => {
  return ROUTE_CONFIG.REGISTRATION_ROUTES.some(route => pathname.startsWith(route))
}

export const isProtectedRoute = (pathname: string): boolean => {
  return ROUTE_CONFIG.PROTECTED_ROUTES.some(route => pathname.startsWith(route))
}

// Para debug - use em desenvolvimento
export const logRouteInfo = (pathname: string) => {
  const routeType = getRouteType(pathname)

  console.log(`
🔍 Informações da Rota:
├── Caminho: ${pathname}
├── Tipo: ${routeType || 'NÃO CATEGORIZADA'}
├── É Pública: ${isPublicRoute(pathname) ? '✅' : '❌'}
├── É Auth: ${isAuthRoute(pathname) ? '✅' : '❌'}
├── É Registro: ${isRegistrationRoute(pathname) ? '✅' : '❌'}
└── É Protegida: ${isProtectedRoute(pathname) ? '✅' : '❌'}
  `)
}
