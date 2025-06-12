This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## exemplo de implementação do protocolChat

import React, { useEffect, useState } from 'react'
import { useAppSelector } from '@/redux-store'
import { useProtocolWebSocket } from '@/hooks/useWebSocket'

interface ProtocolChatProps {
protocolId: string
clientId: string
}

const ProtocolChat: React.FC<ProtocolChatProps> = ({ protocolId, clientId }) => {
// ✅ Hook específico para protocolo
const {
isConnected,
isConnecting,
error,
listenProtocol
} = useProtocolWebSocket(protocolId, clientId)

// ✅ Dados do Redux
const questions = useAppSelector(state => state.questions.questions)
const replies = useAppSelector(state => state.questions.replies)
const protocols = useAppSelector(state => state.protocols.list)

// Estado local
const [newMessage, setNewMessage] = useState('')

// ✅ Escutar eventos do protocolo quando conectar
useEffect(() => {
if (isConnected) {
console.log('🎧 WebSocket conectado, adicionando listeners para protocolo:', protocolId)
listenProtocol(protocolId, clientId)
}
}, [isConnected, protocolId, clientId, listenProtocol])

// ✅ Log quando dados chegam
useEffect(() => {
console.log('📝 Questions atualizadas:', questions)
}, [questions])

useEffect(() => {
console.log('💬 Replies atualizadas:', replies)
}, [replies])

useEffect(() => {
console.log('📋 Protocols atualizados:', protocols)
}, [protocols])

// Filtrar replies do protocolo atual
const protocolQuestions = questions.filter(q =>
// Assumindo que você tem uma forma de associar question ao protocol
true // Ajuste conforme sua lógica
)

const protocolReplies = replies.filter(r =>
protocolQuestions.some(q => q.id === r.question_id)
)

const handleSendMessage = () => {
if (!newMessage.trim()) return

    // Aqui você enviaria a mensagem para o backend
    // O backend então emitiria um evento que seria capturado pelos listeners
    console.log('📤 Enviando mensagem:', newMessage)

    // Simular envio - substitua pela sua API
    // sendMessageAPI(protocolId, newMessage)

    setNewMessage('')

}

return (

<div className="flex flex-col h-full">
{/_ ✅ Status da conexão _/}
<div className="p-4 bg-gray-100 border-b">
<div className="flex items-center gap-2">
<div className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500' : 
            isConnecting ? 'bg-yellow-500' : 
            'bg-red-500'
          }`} />
<span className="text-sm">
{isConnected ? 'Conectado' :
isConnecting ? 'Conectando...' :
'Desconectado'}
</span>
{error && (
<span className="text-red-500 text-xs">({error})</span>
)}
</div>
<div className="text-xs text-gray-600 mt-1">
Protocolo: {protocolId} | Cliente: {clientId}
</div>
</div>

      {/* ✅ Lista de mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {protocolQuestions.map(question => (
          <div key={question.id} className="bg-blue-100 p-3 rounded-lg">
            <div className="font-medium">Pergunta:</div>
            <div>{question.content}</div>

            {/* Replies da pergunta */}
            {protocolReplies
              .filter(reply => reply.question_id === question.id)
              .map(reply => (
                <div
                  key={reply.id}
                  className={`mt-2 p-2 rounded ${
                    reply.isOperator ? 'bg-green-100 ml-4' : 'bg-gray-100 ml-8'
                  }`}
                >
                  <div className="text-xs text-gray-600">
                    {reply.isOperator ? 'Operador' : 'Cliente'}:
                  </div>
                  <div>{reply.content}</div>
                </div>
              ))
            }
          </div>
        ))}

        {protocolQuestions.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            Nenhuma pergunta ainda...
          </div>
        )}
      </div>

      {/* ✅ Input para nova mensagem */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Digite sua mensagem..."
            className="flex-1 p-2 border rounded"
            disabled={!isConnected}
          />
          <button
            onClick={handleSendMessage}
            disabled={!isConnected || !newMessage.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Enviar
          </button>
        </div>
      </div>

      {/* ✅ Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="p-2 bg-yellow-50 border-t text-xs">
          <div>Questions: {questions.length}</div>
          <div>Replies: {replies.length}</div>
          <div>Protocols: {protocols.length}</div>
        </div>
      )}
    </div>

)
}

export default ProtocolChat
