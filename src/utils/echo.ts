// utils/echo.ts - Fixed version with Strict Mode handling
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

declare global {
  interface Window {
    Pusher: typeof Pusher
    Echo: Echo<'pusher'>
  }
}

// Make Pusher available globally (required by Laravel Echo)
if (typeof window !== 'undefined') {
  window.Pusher = Pusher
}

interface EchoConfig {
  broadcaster: 'pusher'
  key: string
  wsHost: string
  wsPort: number
  wssPort: number
  forceTLS: boolean
  enabledTransports: ('ws' | 'wss')[]
  disableStats: boolean
  cluster: string
  authEndpoint: string
  auth: {
    headers: Record<string, string>
  }
}

const createEchoConfig = (authToken: string): EchoConfig => ({
  broadcaster: 'pusher',
  key: process.env.NEXT_PUBLIC_REVERB_APP_KEY || '',
  wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || 'localhost',
  wsPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || '8080', 10),
  wssPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || '8080', 10),
  forceTLS: false,
  enabledTransports: ['ws', 'wss'],
  disableStats: true,
  cluster: process.env.NEXT_PUBLIC_REVERB_CLUSTER || 'local',
  authEndpoint: `${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/v1/broadcasting/auth`,
  auth: {
    headers: {
      Authorization: `Bearer ${authToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }
})

// Store the current Echo instance and its token
let echoInstance: Echo<'pusher'> | null = null
let currentToken: string | null = null

/**
 * Initialize Echo with auth token (prevents double initialization)
 */
export const initializeEcho = (authToken: string): Echo<'pusher'> | null => {
  if (typeof window === 'undefined') return null

  // Prevent re-initialization with the same token (React Strict Mode fix)
  if (echoInstance && currentToken === authToken) {
    console.log('🔍 Echo already initialized with this token, returning existing instance')

    return echoInstance
  }

  // Disconnect existing instance if token changed
  if (echoInstance && currentToken !== authToken) {
    console.log('🔍 Token changed, disconnecting old Echo instance')
    echoInstance.disconnect()
    echoInstance = null
  }

  console.log('🔍 Creating new Echo instance with token:', authToken.substring(0, 20) + '...')

  try {
    echoInstance = new Echo<'pusher'>(createEchoConfig(authToken))
    currentToken = authToken

    // Add connection event listeners for debugging
    const pusher = (echoInstance.connector as any).pusher

    pusher.connection.bind('connected', () => {
      console.log('✅ Pusher connection established successfully')
    })

    pusher.connection.bind('error', (error: any) => {
      console.error('❌ Pusher connection error:', error)
    })

    pusher.connection.bind('disconnected', () => {
      console.log('🔌 Pusher connection disconnected')
    })

    return echoInstance
  } catch (error) {
    console.error('❌ Failed to create Echo instance:', error)

    return null
  }
}

/**
 * Get the current Echo instance
 */
export const getEcho = (): Echo<'pusher'> | null => {
  return echoInstance
}

/**
 * Clean disconnect
 */
export const disconnectEcho = (): void => {
  if (echoInstance) {
    console.log('🔌 Disconnecting Echo instance')
    echoInstance.disconnect()
    echoInstance = null
    currentToken = null
  }
}

/**
 * Helper function to update the authorization header
 */
export const updateEchoAuthHeader = (token: string): void => {
  initializeEcho(token)
}

/**
 * Helper function to check if Echo is connected
 */
export const isEchoConnected = (): boolean => {
  if (!echoInstance || !echoInstance.connector) return false

  const pusherConnector = echoInstance.connector as any

  return pusherConnector.pusher?.connection?.state === 'connected'
}

// For backward compatibility
export const echo: Echo<'pusher'> | null = null
