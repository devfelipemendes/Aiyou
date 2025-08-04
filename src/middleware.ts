import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ROUTE_CONFIG = {
  PUBLIC_ROUTES: ['/politicas-de-privacidade', '/termos-de-uso', '/register'],
  AUTH_ROUTES: ['/login'],
  PROTECTED_ROUTES: ['/painel', '/dashboard', '/profile', '/chat', '/settings'],
  PUBLIC_APIS: ['/api/login', '/api/register', '/api/health']
}

const extractToken = (request: NextRequest): string | null => {
  const cookieToken = request.cookies.get('token')?.value

  if (!cookieToken) {
    const authHeader = request.headers.get('Authorization')

    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.split('Bearer ')[1]
    }
  }

  console.log('🍪 Cookie token:', cookieToken ? 'ENCONTRADO' : 'NÃO ENCONTRADO')

  return cookieToken || null
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const authToken = extractToken(request)

  console.log(`🔍 DEBUG - Rota: ${pathname}`)
  console.log(`🔑 Token: ${authToken ? '✅ TEM' : '❌ NÃO TEM'}`)

  // Proteção de APIs
  if (pathname.startsWith('/api')) {
    const isPublicApi = ROUTE_CONFIG.PUBLIC_APIS.some(route => pathname.startsWith(route))

    if (isPublicApi) {
      console.log('🌐 API pública - liberando acesso')

      return NextResponse.next()
    }

    if (!authToken) {
      console.log('🚨 API protegida sem token - bloqueando')

      return new NextResponse(JSON.stringify({ success: false, message: 'Token necessário' }), {
        status: 401,
        headers: { 'content-type': 'application/json' }
      })
    }

    console.log('🌐 API protegida com token - liberando')

    return NextResponse.next()
  }

  // Rotas públicas - sempre libera
  const isPublicRoute = ROUTE_CONFIG.PUBLIC_ROUTES.some(route => pathname.startsWith(route))

  if (isPublicRoute) {
    console.log('🌍 Rota pública - liberando acesso')

    return NextResponse.next()
  }

  // Tratar a home `/`
  if (pathname === '/') {
    if (authToken) {
      console.log('🏠 Home com token - redirecionando para /painel')

      return NextResponse.redirect(new URL('/painel', request.url))
    } else {
      console.log('🏠 Home sem token - redirecionando para /login')

      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Tratar rotas de auth (como /login)
  const isAuthRoute = ROUTE_CONFIG.AUTH_ROUTES.some(route => pathname.startsWith(route))

  if (isAuthRoute) {
    if (authToken) {
      console.log('🔄 Já logado tentando acessar login - redirecionando para /painel')

      return NextResponse.redirect(new URL('/painel', request.url))
    } else {
      console.log('🔐 Rota de auth sem token - liberando acesso ao login')

      return NextResponse.next()
    }
  }

  // Lógica de proteção das rotas
  const isProtected = ROUTE_CONFIG.PROTECTED_ROUTES.some(route => pathname.startsWith(route))

  console.log(`🛡️ É protegida: ${isProtected ? '✅ SIM' : '❌ NÃO'}`)

  if (isProtected && !authToken) {
    console.log('🚨 BLOQUEANDO! Rota protegida sem token')

    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Proteção final - Qualquer rota não categorizada é PROTEGIDA por padrão
  if (!authToken) {
    console.log('⚠️ Rota não categorizada sem token - BLOQUEANDO por segurança')
    const loginUrl = new URL('/login', request.url)

    loginUrl.searchParams.set('from', pathname)

    return NextResponse.redirect(loginUrl)
  }

  console.log('✅ LIBERANDO acesso')

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)']
}

