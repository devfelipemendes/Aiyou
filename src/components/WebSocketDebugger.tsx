import React, { useState } from 'react'

interface WebSocketMessage {
  id: string
  timestamp: Date
  channel: string
  event: string
  data: any
  type: 'sent' | 'received'
}

interface WebSocketDebuggerProps {
  isConnected: boolean
  activeChannels: string[]
}

// 🔧 Hook para interceptar mensagens WebSocket
export const useWebSocketDebugger = () => {
  const [messages, setMessages] = useState<WebSocketMessage[]>([])
  const [isCapturing, setIsCapturing] = useState(true)
  const maxMessages = 100

  const addMessage = (message: Omit<WebSocketMessage, 'id' | 'timestamp'>) => {
    if (!isCapturing) return

    const newMessage: WebSocketMessage = {
      ...message,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    }

    setMessages(prev => {
      const updated = [newMessage, ...prev]

      return updated.slice(0, maxMessages)
    })
  }

  const clearMessages = () => setMessages([])
  const toggleCapturing = () => setIsCapturing(prev => !prev)

  return {
    messages,
    addMessage,
    clearMessages,
    isCapturing,
    toggleCapturing
  }
}

const WebSocketDebugger: React.FC<WebSocketDebuggerProps> = ({ isConnected, activeChannels }) => {
  const { messages, clearMessages, isCapturing, toggleCapturing } = useWebSocketDebugger()
  const [isOpen, setIsOpen] = useState(false)

  // 🔧 Contar mensagens por tipo
  const messageCounts = messages.reduce(
    (acc, msg) => {
      acc[msg.event] = (acc[msg.event] || 0) + 1

      return acc
    },
    {} as Record<string, number>
  )

  // 🔧 Copiar dados para clipboard
  const copyToClipboard = (data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
  }

  // 🔧 Formatar timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  // 🔧 Obter cor do evento
  const getEventColor = (event: string): string => {
    const colors: Record<string, string> = {
      'question.created': '#2196f3',
      'question.updated': '#9c27b0',
      'reply.created': '#4caf50',
      'reply.updated': '#ff9800',
      'operator.reply.created': '#f44336',
      'operator.reply.updated': '#f44336',
      'protocol.created': '#9c27b0',
      'protocol.updated': '#9c27b0'
    }

    return colors[event] || '#757575'
  }

  // Só mostrar em desenvolvimento
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        zIndex: 9999,
        width: isOpen ? '500px' : '300px',
        maxHeight: '80vh',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        border: '1px solid #e0e0e0',
        transition: 'width 0.3s ease',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: isConnected ? '#e8f5e8' : '#ffebee',
          borderBottom: '1px solid #e0e0e0',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: isConnected ? '#4caf50' : '#f44336'
          }}
        />

        <span
          style={{
            fontSize: '14px',
            fontWeight: '600',
            flex: 1
          }}
        >
          WebSocket Debug
        </span>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span
            style={{
              fontSize: '12px',
              padding: '2px 6px',
              borderRadius: '10px',
              backgroundColor: isConnected ? '#4caf50' : '#f44336',
              color: 'white'
            }}
          >
            {activeChannels.length} canais
          </span>

          <span
            style={{
              fontSize: '12px',
              padding: '2px 6px',
              borderRadius: '10px',
              backgroundColor: '#2196f3',
              color: 'white'
            }}
          >
            {messages.length}
          </span>
        </div>

        <span
          style={{
            fontSize: '12px',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s'
          }}
        >
          ▼
        </span>
      </div>

      {/* Content */}
      {isOpen && (
        <div
          style={{
            maxHeight: '500px',
            overflow: 'auto',
            padding: '16px'
          }}
        >
          {/* Controles */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '16px',
              alignItems: 'center'
            }}
          >
            <button
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                border: '1px solid #2196f3',
                borderRadius: '4px',
                backgroundColor: isCapturing ? '#2196f3' : 'white',
                color: isCapturing ? 'white' : '#2196f3',
                cursor: 'pointer'
              }}
              onClick={toggleCapturing}
            >
              {isCapturing ? '⏸️ Pausar' : '▶️ Capturar'}
            </button>

            <button
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                border: '1px solid #f44336',
                borderRadius: '4px',
                backgroundColor: 'white',
                color: '#f44336',
                cursor: 'pointer'
              }}
              onClick={clearMessages}
              disabled={messages.length === 0}
            >
              🗑️ Limpar
            </button>

            <span
              style={{
                marginLeft: 'auto',
                fontSize: '11px',
                color: '#666'
              }}
            >
              {messages.length}/100
            </span>
          </div>

          {/* Status da Conexão */}
          <div
            style={{
              padding: '12px',
              backgroundColor: isConnected ? '#e8f5e8' : '#ffebee',
              border: `1px solid ${isConnected ? '#4caf50' : '#f44336'}`,
              borderRadius: '4px',
              marginBottom: '16px',
              fontSize: '12px'
            }}
          >
            <div>
              <strong>Status:</strong> {isConnected ? 'Conectado' : 'Desconectado'}
            </div>
            <div>
              <strong>Canais Ativos:</strong> {activeChannels.length}
            </div>
            {activeChannels.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                {activeChannels.map(channel => (
                  <span
                    key={channel}
                    style={{
                      display: 'inline-block',
                      padding: '2px 6px',
                      margin: '2px',
                      backgroundColor: '#e3f2fd',
                      borderRadius: '10px',
                      fontSize: '10px'
                    }}
                  >
                    {channel}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Resumo dos Eventos */}
          {Object.keys(messageCounts).length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>Eventos Capturados:</div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {Object.entries(messageCounts).map(([event, count]) => (
                  <span
                    key={event}
                    style={{
                      display: 'inline-block',
                      padding: '2px 6px',
                      backgroundColor: getEventColor(event),
                      color: 'white',
                      borderRadius: '10px',
                      fontSize: '10px'
                    }}
                  >
                    {event} ({count})
                  </span>
                ))}
              </div>
            </div>
          )}

          <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #e0e0e0' }} />

          {/* Lista de Mensagens */}
          {messages.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                color: '#666',
                fontSize: '12px',
                padding: '20px'
              }}
            >
              {isCapturing ? 'Aguardando mensagens...' : 'Captura pausada'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {messages.map(message => (
                <div
                  key={message.id}
                  style={{
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    padding: '12px'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px'
                    }}
                  >
                    <span
                      style={{
                        padding: '2px 6px',
                        backgroundColor: getEventColor(message.event),
                        color: 'white',
                        borderRadius: '10px',
                        fontSize: '10px'
                      }}
                    >
                      {message.event}
                    </span>

                    <span style={{ fontSize: '10px', color: '#666' }}>{formatTime(message.timestamp)}</span>

                    <span style={{ fontSize: '10px', flex: 1 }}>Canal: {message.channel}</span>

                    <button
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                      onClick={() => copyToClipboard(message.data)}
                      title='Copiar dados'
                    >
                      📋
                    </button>
                  </div>

                  <div
                    style={{
                      backgroundColor: '#f5f5f5',
                      padding: '8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontFamily: 'monospace',
                      maxHeight: '100px',
                      overflow: 'auto'
                    }}
                  >
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(message.data, null, 2)}</pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default WebSocketDebugger
