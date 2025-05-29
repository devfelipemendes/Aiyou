import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/register', '/']
const AUTH_COOKIE_NAME = 'token' // Consistente com o resto do código
const DASHBOARD_ROUTE = '/home'
const LOGIN_ROUTE = '/login'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname)
  const isApiRoute = pathname.startsWith('/api')

  // Verificar token (cookie primeiro, depois header)
  const authToken =
    request.cookies.get(AUTH_COOKIE_NAME)?.value || request.headers.get('Authorization')?.split('Bearer ')[1]

  // Para rotas de API
  if (isApiRoute) {
    if (!authToken && !pathname.includes('/login')) {
      return new NextResponse(JSON.stringify({ success: false, message: 'Autenticação necessária' }), {
        status: 401,
        headers: { 'content-type': 'application/json' }
      })
    }

    return NextResponse.next()
  }

  if (authToken && isPublicRoute && pathname !== '/') {
    return NextResponse.redirect(new URL(DASHBOARD_ROUTE, request.url))
  }

  if (authToken && pathname === '/login') {
    return NextResponse.redirect(new URL(DASHBOARD_ROUTE, request.url))
  }

  // Redirecionamentos
  if (!authToken && !isPublicRoute) {
    const loginUrl = new URL(LOGIN_ROUTE, request.url)

    loginUrl.searchParams.set('from', pathname)

    return NextResponse.redirect(loginUrl)
  }

  // Adicionar token aos headers se disponível
  const requestHeaders = new Headers(request.headers)

  if (authToken && !requestHeaders.has('Authorization')) {
    requestHeaders.set('Authorization', `Bearer ${authToken}`)
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  })
}

export const config = {
  matcher: ['/home, /chat']
}
