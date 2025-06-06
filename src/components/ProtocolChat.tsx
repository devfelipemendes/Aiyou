// components/ProtocolChat.tsx
import type { FormEvent } from 'react'
import { useState, useEffect, useCallback, useRef } from 'react'

import { useProtocolEvents } from '@/hooks/useProtocolChannel'
import type {
  UnifiedMessage,
  QuestionCreatedEvent,
  ReplyCreatedEvent,
  OperatorReplyCreatedEvent
} from '@/types/websocketTypes'

interface ProtocolChatProps {
  protocolId: string
  authToken: string
}

/**
 * ProtocolChat Component
 *
 * A real-time chat interface that connects to a specific protocol channel
 * and displays messages as they arrive via WebSocket (no initial fetch)
 */
export default function ProtocolChat({ protocolId, authToken }: ProtocolChatProps) {
  const [messages, setMessages] = useState<UnifiedMessage[]>([]) // Start with empty array
  const [inputValue, setInputValue] = useState<string>('')
  const [sending, setSending] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // REMOVED: Initial message fetching - we only show new WebSocket messages
  // useEffect(() => {
  //   const fetchMessages = async (): Promise<void> => {
  //     // This has been removed - we only show live messages now
  //   };
  //   fetchMessages();
  // }, [protocolId, authToken]);

  // Handle incoming WebSocket events with proper typing and duplicate prevention
  const handleQuestionCreated = useCallback((data: QuestionCreatedEvent) => {
    console.log('New question received:', data)

    const newMessage: UnifiedMessage = {
      id: data.id,
      type: 'question',
      content: data.content,
      role: data.role,
      timestamp: data.created_at,
      operator: data.operator,
      answered: data.answered,
      approved: data.approved
    }

    // Prevent duplicate messages
    setMessages(prev => {
      // Check if message already exists
      const exists = prev.find(msg => msg.id === data.id)

      if (exists) {
        console.log('🔄 Duplicate question ignored:', data.id)

        return prev
      }

      console.log('✅ Adding new question:', data.id)

      return [...prev, newMessage]
    })

    // Show notification for operator requests
    if (data.operator) {
      console.log('🚨 Operator assistance requested!')
    }
  }, [])

  const handleReplyCreated = useCallback((data: ReplyCreatedEvent) => {
    console.log('New reply received:', data)

    const newMessage: UnifiedMessage = {
      id: data.id,
      type: 'reply',
      content: data.content,
      role: data.role,
      timestamp: data.created_at,
      approved: data.approved,
      question_id: data.question_id
    }

    // Prevent duplicate messages
    setMessages(prev => {
      // Check if message already exists
      const exists = prev.find(msg => msg.id === data.id)

      if (exists) {
        console.log('🔄 Duplicate reply ignored:', data.id)

        return prev
      }

      console.log('✅ Adding new reply:', data.id)

      return [...prev, newMessage]
    })
  }, [])

  const handleOperatorReplyCreated = useCallback((data: OperatorReplyCreatedEvent) => {
    console.log('Operator reply received:', data)

    const newMessage: UnifiedMessage = {
      id: data.id,
      type: 'operator_reply',
      content: data.content,
      role: data.role,
      timestamp: data.created_at
    }

    // Prevent duplicate messages
    setMessages(prev => {
      // Check if message already exists
      const exists = prev.find(msg => msg.id === data.id)

      if (exists) {
        console.log('🔄 Duplicate operator reply ignored:', data.id)

        return prev
      }

      console.log('✅ Adding new operator reply:', data.id)

      return [...prev, newMessage]
    })
  }, [])

  // Use the typed event hook
  const connectionStatus = useProtocolEvents(protocolId, authToken, {
    onQuestionCreated: handleQuestionCreated,
    onReplyCreated: handleReplyCreated,
    onOperatorReplyCreated: handleOperatorReplyCreated
  })

  // Function to send a new question
  const sendQuestion = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()

    if (!inputValue.trim() || sending) return

    setSending(true)
    setError(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/api/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
          Accept: 'application/json'
        },
        body: JSON.stringify({
          protocol: protocolId,
          content: inputValue.trim(),
          role: 'user',
          operator: false,
          answered: false,
          approoved: false
        })
      })

      if (!response.ok) {
        const errorData = await response.json()

        throw new Error(errorData.message || 'Failed to send question')
      }

      // Clear the input on success
      setInputValue('')

      // The WebSocket will handle adding the message to the UI
    } catch (err) {
      console.error('Error sending question:', err)
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  // No loading state needed since we're not fetching initial messages
  // Render error state only for WebSocket/sending errors
  if (error) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-red-500'>Error: {error}</div>
      </div>
    )
  }

  return (
    <div className='protocol-chat flex flex-col h-full'>
      {/* Connection status indicator */}
      <ConnectionStatusBar status={connectionStatus} protocolId={protocolId} />

      {/* Messages container */}
      <div className='messages-container flex-1 overflow-y-auto p-4 space-y-4'>
        {messages.length === 0 ? (
          <div className='text-center text-gray-500'>
            <div className='mb-2'>🎧 Listening for live messages...</div>
            <div className='text-sm'>
              Connected to protocol: <strong>{protocolId}</strong>
            </div>
            <div className='text-sm mt-2'>Start typing below to send the first message!</div>
          </div>
        ) : (
          messages.map((message, index) => (
            <MessageItem
              key={`${message.id}-${index}`} // Add index as fallback for unique keys
              message={message}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <form onSubmit={sendQuestion} className='p-4 border-t'>
        <div className='flex gap-2'>
          <input
            type='text'
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder='Type your message...'
            disabled={sending || connectionStatus !== 'connected'}
            className='flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50'
          />
          <button
            type='submit'
            disabled={sending || !inputValue.trim() || connectionStatus !== 'connected'}
            className='px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
        {connectionStatus !== 'connected' && (
          <div className='text-xs text-gray-500 mt-1'>Status: {connectionStatus} - Input disabled until connected</div>
        )}
      </form>
    </div>
  )
}

/**
 * ConnectionStatusBar Component
 * Displays the current WebSocket connection status
 */
interface ConnectionStatusBarProps {
  status: string
  protocolId: string
}

function ConnectionStatusBar({ status, protocolId }: ConnectionStatusBarProps) {
  const getStatusColor = (): string => {
    switch (status) {
      case 'connected':
        return 'bg-green-500'
      case 'connecting':
        return 'bg-yellow-500 animate-pulse'
      case 'error':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = (): string => {
    switch (status) {
      case 'connected':
        return 'Connected - Live messages only'
      case 'connecting':
        return 'Connecting...'
      case 'error':
        return 'Connection Error'
      default:
        return 'Disconnected'
    }
  }

  return (
    <div className='connection-status p-2 bg-gray-100 border-b'>
      <div className='flex items-center gap-2'>
        <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
        <span className='text-sm text-gray-600'>{getStatusText()}</span>
        <span className='text-sm text-gray-500 ml-auto'>Protocol: {protocolId}</span>
      </div>
    </div>
  )
}

/**
 * MessageItem Component
 * Renders individual messages with appropriate styling
 */
interface MessageItemProps {
  message: UnifiedMessage
}

function MessageItem({ message }: MessageItemProps) {
  const getMessageClasses = (): string => {
    const baseClasses = 'p-4 rounded-lg'

    switch (message.type) {
      case 'question':
        return `${baseClasses} ${message.operator ? 'bg-red-50 border border-red-200' : 'bg-blue-50'}`
      case 'reply':
        return `${baseClasses} bg-green-50`
      case 'operator_reply':
        return `${baseClasses} bg-purple-50 border border-purple-200`
      default:
        return baseClasses
    }
  }

  const getRoleLabel = (): string => {
    switch (message.role) {
      case 'user':
        return 'User'
      case 'assistant':
        return 'Assistant'
      case 'operator':
        return 'Operator'
      case 'system':
        return 'System'
      default:
        return message.role
    }
  }

  const formatTime = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className={getMessageClasses()}>
      <div className='flex items-center justify-between mb-2'>
        <span className='font-semibold text-sm'>{getRoleLabel()}</span>
        <span className='text-xs text-gray-500'>{formatTime(message.timestamp)}</span>
      </div>

      <div className='message-content text-gray-800 whitespace-pre-wrap'>{message.content}</div>

      {/* Status indicators */}
      <div className='mt-2 flex gap-2'>
        {message.type === 'question' && message.operator && (
          <span className='text-xs bg-red-100 text-red-700 px-2 py-1 rounded'>Operator Requested</span>
        )}

        {message.type === 'question' && message.answered && (
          <span className='text-xs bg-green-100 text-green-700 px-2 py-1 rounded'>Answered</span>
        )}

        {message.type === 'reply' && !message.approved && (
          <span className='text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded'>Pending Approval</span>
        )}
      </div>
    </div>
  )
}
