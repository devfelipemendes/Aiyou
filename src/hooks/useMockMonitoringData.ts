// hooks/useMockMonitoringData.ts
import { useState, useEffect } from 'react'

// Mock que simula exatamente a estrutura real das APIs
const mockActiveChats = {
  data: [
    {
      protocol: '240720251704318088',
      assistant: {
        id: 'd77ed7e3-e9f0-4886-bbb1-9fad8cfd15b2',
        name: 'Play Assistant',
        img_url: null,
        description: null,
        phones: [{ id: '07e032b4-36a2-41ad-a643-4bcec8eed741', phone: '15551904304' }]
      },
      project_id: 'd77ed7e3-e9f0-4886-bbb1-9fad8cfd15b2',
      source: 'whatsapp' as const,
      identifier: '61983398676',
      operator: 0,
      error: 'JOB_FAREWELL_ERROR',
      question_operator: 1,
      status: 'active',
      updated_at: '2025-07-26T18:05:47-03:00',
      created_at: '2025-07-26T17:04:31-03:00'
    },
    {
      protocol: '240720251704249641',
      assistant: {
        id: 'd77ed7e3-e9f0-4886-bbb1-9fad8cfd15b2',
        name: 'Support Bot',
        img_url: null,
        description: null,
        phones: [{ id: '07e032b4-36a2-41ad-a643-4bcec8eed741', phone: '15551904304' }]
      },
      project_id: 'd77ed7e3-e9f0-4886-bbb1-9fad8cfd15b2',
      source: 'telegram' as const,
      identifier: '5561983398675',
      operator: 1,
      error: null,
      question_operator: 0,
      status: 'active',
      updated_at: '2025-07-26T18:04:25-03:00',
      created_at: '2025-07-26T17:04:25-03:00'
    },
    {
      protocol: '240720251705046068',
      assistant: {
        id: 'd77ed7e3-e9f0-4886-bbb1-9fad8cfd15b2',
        name: 'Sales Assistant',
        img_url: null,
        description: null,
        phones: [{ id: '07e032b4-36a2-41ad-a643-4bcec8eed741', phone: '15551904304' }]
      },
      project_id: 'd77ed7e3-e9f0-4886-bbb1-9fad8cfd15b2',
      source: 'webchat' as const,
      identifier: 'client@empresa.com',
      operator: 0,
      error: null,
      question_operator: 0,
      status: 'active',
      updated_at: '2025-07-26T16:30:15-03:00',
      created_at: '2025-07-26T16:28:10-03:00'
    },
    {
      protocol: '240720251706123456',
      assistant: {
        id: 'd77ed7e3-e9f0-4886-bbb1-9fad8cfd15b2',
        name: 'Tech Support',
        img_url: null,
        description: null,
        phones: [{ id: '07e032b4-36a2-41ad-a643-4bcec8eed741', phone: '15551904304' }]
      },
      project_id: 'd77ed7e3-e9f0-4886-bbb1-9fad8cfd15b2',
      source: 'email' as const,
      identifier: 'user@company.com',
      operator: 0,
      error: null,
      question_operator: 0,
      status: 'active',
      updated_at: '2025-07-26T15:45:30-03:00',
      created_at: '2025-07-26T15:42:20-03:00'
    }
  ]
}

const mockHistories = {
  data: {
    '240720251704318088': {
      identifier: '61983398676',
      source: 'whatsapp',
      assistant_name: 'Play Assistant',
      operator_name: 'João Silva',
      history: [
        {
          id: '01983e09-c184-7124-97c1-efc6953f90d8',
          content: 'Oi! Eu sou o Playton, seu assistente virtual da Play Tecnologia. Como posso te ajudar hoje?',
          role: 'assistant' as const,
          operator: null,
          created_at: '2025-07-26T17:04:43-03:00'
        },
        {
          id: '01983e0a-55d7-73a2-9e5c-558c4ac0fbe0',
          content: 'Quais os planos disponíveis?',
          role: 'user' as const,
          operator: 0,
          created_at: '2025-07-26T17:05:21-03:00'
        },
        {
          id: '01983e0a-82c4-70b5-8d31-0a8dbfbb3e3e',
          content:
            'Temos três planos principais: Básico (R$ 29/mês), Profissional (R$ 59/mês) e Empresarial (R$ 149/mês). Qual seria ideal para você?',
          role: 'assistant' as const,
          operator: null,
          created_at: '2025-07-26T17:05:32-03:00'
        },
        {
          id: '01983e0a-952f-7354-acbf-3e59897d1fe1',
          content: 'Preciso falar com um atendente humano',
          role: 'user' as const,
          operator: 1,
          created_at: '2025-07-26T17:05:37-03:00'
        },
        {
          id: '01983e0b-112a-8234-bcde-4f60987d2fe2',
          content: 'Olá! Sou João, atendente humano. Como posso ajudá-lo?',
          role: 'operator' as const,
          operator: 1,
          created_at: '2025-07-26T17:06:15-03:00'
        },
        {
          id: '01983e0b-223b-9345-cdef-5g71098e3gf3',
          content: 'Gostaria de informações sobre migração do plano básico para empresarial',
          role: 'user' as const,
          operator: 1,
          created_at: '2025-07-26T17:07:20-03:00'
        }
      ]
    },
    '240720251704249641': {
      identifier: '5561983398675',
      source: 'telegram',
      assistant_name: 'Support Bot',
      operator_name: 'Maria Santos',
      history: [
        {
          id: '01983e0a-43d1-7115-be58-0d55b9c1650c',
          content: 'Olá! Bem-vindo ao suporte técnico. Como posso ajudá-lo?',
          role: 'assistant' as const,
          operator: null,
          created_at: '2025-07-26T17:05:16-03:00'
        },
        {
          id: '01983e0b-54d2-8226-cf69-1e66c2d751d0',
          content: 'Estou com problema no login',
          role: 'user' as const,
          operator: 0,
          created_at: '2025-07-26T17:05:45-03:00'
        },
        {
          id: '01983e0b-65e3-9337-dg7a-2f77d3e862e1',
          content: 'Vou transferir para nossa especialista Maria que vai resolver seu problema',
          role: 'assistant' as const,
          operator: null,
          created_at: '2025-07-26T17:06:02-03:00'
        },
        {
          id: '01983e0b-76f4-aa48-eh8b-3g88e4f973f2',
          content: 'Oi! Sou a Maria. Vou te ajudar com o login. Qual erro aparece?',
          role: 'operator' as const,
          operator: 1,
          created_at: '2025-07-26T17:06:45-03:00'
        }
      ]
    },
    '240720251705046068': {
      identifier: 'client@empresa.com',
      source: 'webchat',
      assistant_name: 'Sales Assistant',
      operator_name: null,
      history: [
        {
          id: '01983e0a-76f4-aa48-eh8b-3g88e4f973f2',
          content: 'Olá! Interessado em nossos produtos? Posso apresentar nossas soluções!',
          role: 'assistant' as const,
          operator: null,
          created_at: '2025-07-26T16:28:15-03:00'
        },
        {
          id: '01983e0a-87g5-bb59-fi9c-4h99f5ga84g3',
          content: 'Sim, preciso de um sistema para gestão de estoque',
          role: 'user' as const,
          operator: 0,
          created_at: '2025-07-26T16:29:30-03:00'
        },
        {
          id: '01983e0a-98h6-cc6a-gj0d-5i00g6hb95h4',
          content:
            'Perfeito! Temos o módulo ERP que atende exatamente essa necessidade. Posso agendar uma demonstração?',
          role: 'assistant' as const,
          operator: null,
          created_at: '2025-07-26T16:29:50-03:00'
        }
      ]
    },
    '240720251706123456': {
      identifier: 'user@company.com',
      source: 'email',
      assistant_name: 'Tech Support',
      operator_name: null,
      history: [
        {
          id: '01983e0a-a9i7-dd7b-hk1e-6j11h7ic06i5',
          content: 'Olá! Recebemos sua solicitação de suporte técnico. Como posso ajudá-lo?',
          role: 'assistant' as const,
          operator: null,
          created_at: '2025-07-26T15:42:25-03:00'
        },
        {
          id: '01983e0a-baj8-ee8c-il2f-7k22i8jd17j6',
          content: 'Estou tendo problemas com sincronização de dados entre os módulos',
          role: 'user' as const,
          operator: 0,
          created_at: '2025-07-26T15:43:40-03:00'
        },
        {
          id: '01983e0a-cbk9-ff9d-jm3g-8l33j9ke28k7',
          content: 'Entendi. Vou verificar os logs do sistema. Pode me informar quando começou o problema?',
          role: 'assistant' as const,
          operator: null,
          created_at: '2025-07-26T15:44:10-03:00'
        }
      ]
    }
  }
}

export function useMockMonitoringData() {
  const [loading, setLoading] = useState(true)
  const [activeChats, setActiveChats] = useState<any[]>([])
  const [clientHistories, setClientHistories] = useState<Record<string, any>>({})
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    console.log('🎭 Inicializando dados mock para monitoramento...')

    const timer = setTimeout(() => {
      setActiveChats(mockActiveChats.data)
      setClientHistories(mockHistories.data)
      setLoading(false)

      console.log('🎯 Mock data carregado com sucesso!')
      console.log('📊 Chats ativos:', mockActiveChats.data.length)
      console.log('📂 Históricos carregados:', Object.keys(mockHistories.data).length)

      // Log detalhado para debug
      mockActiveChats.data.forEach(chat => {
        console.log(`📱 Chat ${chat.protocol} - ${chat.source} - ${chat.assistant.name}`)
      })
    }, 1500) // Simular delay real da API

    return () => clearTimeout(timer)
  }, [])

  const getHistoryByProtocol = (protocol: string) => {
    const history = clientHistories[protocol] || null

    if (history) {
      console.log(`📖 Histórico encontrado para protocolo ${protocol}: ${history.history.length} mensagens`)
    }

    return history
  }

  const getHistoriesByClient = (identifier: string) => {
    const result: Record<string, any> = {}

    Object.keys(clientHistories).forEach(protocol => {
      const history = clientHistories[protocol]

      if (history.identifier === identifier) {
        result[protocol] = history
      }
    })

    console.log(`👤 Históricos do cliente ${identifier}:`, Object.keys(result).length)

    return result
  }

  const refetchAll = () => {
    console.log('🔄 Simulando refetch completo...')
    setRefreshing(true)
    setLoading(true)

    setTimeout(() => {
      setLoading(false)
      setRefreshing(false)
      console.log('✅ Refetch mock concluído!')
    }, 800)
  }

  const refetchActiveChats = () => {
    console.log('🔄 Simulando refetch de chats ativos...')
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
      console.log('✅ Chats ativos atualizados!')
    }, 400)
  }

  const refetchHistories = () => {
    console.log('🔄 Simulando refetch de históricos...')
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
      console.log('✅ Históricos atualizados!')
    }, 600)
  }

  // Calcular estatísticas realísticas
  const stats = {
    totalProtocols: Object.keys(clientHistories).length,
    totalMessages: Object.values(clientHistories).reduce((sum: number, h: any) => sum + h.history.length, 0),
    clientsCount: new Set(Object.values(clientHistories).map((h: any) => h.identifier)).size,
    lastUpdate: Date.now()
  }

  return {
    // Dados principais
    activeChats,
    clientHistories,

    // Estados de loading
    isFullyLoaded: !loading,
    hasErrors: false,
    activeChatsLoading: loading,
    historiesLoading: loading,

    // Estados de erro
    activeChatsError: null,
    historiesError: null,

    // Estatísticas
    historiesStats: stats,

    // Funções de refetch
    refetchAll,
    refetchActiveChats,
    refetchHistories,

    // Helpers
    getHistoryByProtocol,
    getHistoriesByClient,

    // Estado de refreshing
    isRefreshing: refreshing
  }
}
