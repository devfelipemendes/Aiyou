// hooks/useProtocolChannel.ts - Fixed with Strict Mode handling and auth debugging
import { useEffect, useRef, useState, useCallback } from 'react'

import { initializeEcho, disconnectEcho } from '@/utils/echo'
import type {
  ConnectionStatus,
  UseProtocolChannelReturn,
  QuestionCreatedEvent,
  ReplyCreatedEvent,
  OperatorReplyCreatedEvent
} from '@/types/websocketTypes'

export function useProtocolChannel(
  protocolId: string | null | undefined,
  authToken: string | null | undefined
): UseProtocolChannelReturn {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
  const channelRef = useRef<any>(null)
  const listenersRef = useRef<Map<string, (data: any) => void>>(new Map())
  const isInitializedRef = useRef<boolean>(false)

  useEffect(() => {
    // Validate inputs
    if (!protocolId || !authToken) {
      console.warn('Missing required data for WebSocket connection')
      setConnectionStatus('disconnected')

      return
    }

    // Prevent double initialization in React Strict Mode
    if (isInitializedRef.current) {
      console.log('🔍 Skipping re-initialization (React Strict Mode)')

      return
    }

    isInitializedRef.current = true

    const initializeConnection = async () => {
      console.log('🔍 Auth should be working - proceeding with WebSocket connection...')

      // Initialize Echo with auth token
      console.log(`🔍 Initializing Echo for protocol: ${protocolId}`)
      const echo = initializeEcho(authToken)

      if (!echo) {
        console.error('❌ Failed to initialize Echo')
        setConnectionStatus('error')

        return
      }

      try {
        console.log(`🔍 Attempting to connect to private channel: protocol.${protocolId}`)
        setConnectionStatus('connecting')

        // Clean up any existing channel
        if (channelRef.current) {
          echo.leaveChannel(channelRef.current.name)
        }

        // Connect to the private channel
        channelRef.current = echo.private(`protocol.${protocolId}`)

        // Handle successful subscription
        channelRef.current.subscribed(() => {
          console.log(`✅ Successfully subscribed to protocol: ${protocolId}`)
          setConnectionStatus('connected')
        })

        // Handle subscription errors with detailed logging
        channelRef.current.error((error: any) => {
          console.error(`❌ Failed to subscribe to protocol: ${protocolId}`, error)
          console.error('❌ Error details:', {
            type: error.type,
            status: error.status,
            message: error.error
          })

          if (error.status === 403) {
            console.log('💡 403 Error suggests:')
            console.log('   1. Invalid bearer token')
            console.log('   2. User not authorized for this channel')
            console.log('   3. Laravel channel authorization rules rejecting the user')
            console.log('   4. Missing or incorrect auth middleware')
          }

          setConnectionStatus('error')
        })
      } catch (error) {
        console.error('❌ Channel connection error:', error)
        setConnectionStatus('error')
      }
    }

    initializeConnection()

    // Cleanup function
    return () => {
      console.log('🔍 Cleaning up WebSocket connection')

      if (channelRef.current) {
        // Remove all event listeners
        listenersRef.current.forEach((listener, event) => {
          channelRef.current.stopListening(`.${event}`)
        })
        listenersRef.current.clear()
        channelRef.current = null
      }

      // Don't disconnect Echo here as it might be used by other components
      // disconnectEcho(); // Only disconnect if you're sure no other components need it

      setConnectionStatus('disconnected')
      isInitializedRef.current = false
    }
  }, [protocolId, authToken])

  const listen = useCallback((event: string, callback: (data: any) => void) => {
    if (!channelRef.current) {
      console.warn(`Cannot listen to event '${event}' - no active channel`)

      return
    }

    listenersRef.current.set(event, callback)
    channelRef.current.listen(`.${event}`, callback)
    console.log(`👂 Now listening for event: ${event}`)
  }, [])

  const stopListening = useCallback((event: string) => {
    if (!channelRef.current) return

    channelRef.current.stopListening(`.${event}`)
    listenersRef.current.delete(event)
    console.log(`🔇 Stopped listening for event: ${event}`)
  }, [])

  return {
    channel: channelRef.current,
    listen,
    stopListening,
    connectionStatus
  }
}

export function useProtocolEvents(
  protocolId: string | null | undefined,
  authToken: string | null | undefined,
  handlers: {
    onQuestionCreated?: (data: QuestionCreatedEvent) => void
    onReplyCreated?: (data: ReplyCreatedEvent) => void
    onOperatorReplyCreated?: (data: OperatorReplyCreatedEvent) => void
  }
): ConnectionStatus {
  const { listen, connectionStatus } = useProtocolChannel(protocolId, authToken)

  useEffect(() => {
    if (connectionStatus !== 'connected') return

    if (handlers.onQuestionCreated) {
      listen('question.created', handlers.onQuestionCreated)
    }

    if (handlers.onReplyCreated) {
      listen('reply.created', handlers.onReplyCreated)
    }

    if (handlers.onOperatorReplyCreated) {
      listen('operator.reply.created', handlers.onOperatorReplyCreated)
    }
  }, [connectionStatus, listen, handlers])

  return connectionStatus
}
