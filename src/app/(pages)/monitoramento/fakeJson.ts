// src/app/(pages)/operador/monitoramento/fakeJson.ts - VERSÃO ATUALIZADA

interface ClientData {
  clientId: string
  channel: 'web' | 'whatsapp' | 'telegram' | 'email'
  messages: Array<{
    id: string
    sender: 'operador' | 'client' | 'IA'
    content: string
    timestamp: Date
  }>
  operatorName?: string
  isAIActive: boolean
}

//teste

// 🔥 DADOS VARIADOS para testar todas as notificações
export const clientsData: ClientData[] = [
  // 🔴 CENÁRIO 1: Chamada do Operador (operator_call)
  {
    clientId: 'CHAT001',
    channel: 'whatsapp',
    isAIActive: false,
    operatorName: 'João Silva',
    messages: [
      {
        id: '1',
        sender: 'client',
        content: 'PRECISO FALAR COM UM HUMANO URGENTE!!!',
        timestamp: new Date(Date.now() - 120000) // 2 min atrás
      },
      {
        id: '2',
        sender: 'IA',
        content: 'Entendo sua urgência. Vou conectar você com um operador.',
        timestamp: new Date(Date.now() - 100000)
      },
      {
        id: '3',
        sender: 'client',
        content: 'Por favor, é muito urgente!',
        timestamp: new Date(Date.now() - 60000) // 1 min atrás
      }
    ]
  },

  // 🔴 CENÁRIO 2: Outra Chamada do Operador
  {
    clientId: 'CHAT002',
    channel: 'telegram',
    isAIActive: true,
    messages: [
      {
        id: '4',
        sender: 'client',
        content: 'A IA não está resolvendo meu problema. Quero falar com alguém.',
        timestamp: new Date(Date.now() - 300000) // 5 min atrás
      },
      {
        id: '5',
        sender: 'IA',
        content: 'Posso tentar te ajudar. Qual é o problema específico?',
        timestamp: new Date(Date.now() - 280000)
      },
      {
        id: '6',
        sender: 'client',
        content: 'Não! Quero uma pessoa AGORA!',
        timestamp: new Date(Date.now() - 180000) // 3 min atrás
      }
    ]
  },

  // 🟡 CENÁRIO 3: Chat Não Resolvido (unresolved)
  {
    clientId: 'CHAT003',
    channel: 'email',
    isAIActive: false,
    operatorName: 'Maria Santos',
    messages: [
      {
        id: '7',
        sender: 'client',
        content: 'Meu produto chegou defeituoso',
        timestamp: new Date(Date.now() - 1800000) // 30 min atrás
      },
      {
        id: '8',
        sender: 'operador',
        content: 'Lamento pelo inconveniente. Vou verificar isso para você.',
        timestamp: new Date(Date.now() - 1740000)
      },
      {
        id: '9',
        sender: 'client',
        content: 'Já faz 1 hora e nada foi resolvido. Vou cancelar tudo!',
        timestamp: new Date(Date.now() - 1200000) // 20 min atrás
      },
      {
        id: '10',
        sender: 'operador',
        content: 'Peço desculpas pela demora. Infelizmente não conseguimos resolver hoje.',
        timestamp: new Date(Date.now() - 900000) // 15 min atrás
      }
    ]
  },

  // 🟠 CENÁRIO 4: Sem Resposta há Muito Tempo (no_response)
  {
    clientId: 'CHAT004',
    channel: 'web',
    isAIActive: true,
    messages: [
      {
        id: '11',
        sender: 'client',
        content: 'Olá, preciso de ajuda com meu pedido',
        timestamp: new Date(Date.now() - 2700000) // 45 min atrás
      },
      {
        id: '12',
        sender: 'IA',
        content: 'Olá! Claro, posso te ajudar. Qual é o número do seu pedido?',
        timestamp: new Date(Date.now() - 2640000) // 44 min atrás
      },
      {
        id: '13',
        sender: 'client',
        content: 'É o pedido #12345',
        timestamp: new Date(Date.now() - 2580000) // 43 min atrás
      },
      {
        id: '14',
        sender: 'IA',
        content: 'Encontrei seu pedido. Está sendo preparado e deve ser enviado hoje.',
        timestamp: new Date(Date.now() - 2520000) // 42 min atrás
      },
      {
        id: '15',
        sender: 'IA',
        content: 'Precisa de mais alguma coisa?',
        timestamp: new Date(Date.now() - 2400000) // 40 min atrás
      }

      // Cliente não respondeu há 40 minutos
    ]
  },

  // 🟠 CENÁRIO 5: Outro Sem Resposta
  {
    clientId: 'CHAT005',
    channel: 'whatsapp',
    isAIActive: false,
    operatorName: 'Ana Costa',
    messages: [
      {
        id: '16',
        sender: 'client',
        content: 'Quando vai chegar meu pedido?',
        timestamp: new Date(Date.now() - 3600000) // 1 hora atrás
      },
      {
        id: '17',
        sender: 'operador',
        content: 'Oi! Sou a Ana. Vou verificar para você.',
        timestamp: new Date(Date.now() - 3540000)
      },
      {
        id: '18',
        sender: 'operador',
        content: 'Seu pedido saiu para entrega hoje. Chegará até 18h.',
        timestamp: new Date(Date.now() - 3480000)
      }

      // Cliente não respondeu há quase 1 hora
    ]
  },

  // 🔵 CENÁRIO 6: Operador em Controle (operator_control)
  {
    clientId: 'CHAT006',
    channel: 'telegram',
    isAIActive: false,
    operatorName: 'Carlos Lima',
    messages: [
      {
        id: '19',
        sender: 'client',
        content: 'Estou com problema no pagamento',
        timestamp: new Date(Date.now() - 300000) // 5 min atrás
      },
      {
        id: '20',
        sender: 'IA',
        content: 'Posso te ajudar com problemas de pagamento. Qual cartão você usou?',
        timestamp: new Date(Date.now() - 280000)
      },
      {
        id: '21',
        sender: 'client',
        content: 'Cartão final 1234, mas não foi aprovado',
        timestamp: new Date(Date.now() - 240000)
      },
      {
        id: '22',
        sender: 'operador',
        content: 'Oi! Sou o Carlos, acabei de assumir seu atendimento. Vou resolver isso.',
        timestamp: new Date(Date.now() - 120000) // 2 min atrás (recente)
      },
      {
        id: '23',
        sender: 'operador',
        content: 'Verifiquei aqui e o problema é com o limite do cartão. Tente outro meio de pagamento.',
        timestamp: new Date(Date.now() - 60000) // 1 min atrás
      }
    ]
  },

  // 🔵 CENÁRIO 7: Outro Operador em Controle
  {
    clientId: 'CHAT007',
    channel: 'email',
    isAIActive: false,
    operatorName: 'Pedro Oliveira',
    messages: [
      {
        id: '24',
        sender: 'client',
        content: 'Recebi produto errado no meu pedido',
        timestamp: new Date(Date.now() - 600000) // 10 min atrás
      },
      {
        id: '25',
        sender: 'operador',
        content: 'Oi! Sou Pedro. Que situação! Vou resolver isso para você agora mesmo.',
        timestamp: new Date(Date.now() - 180000) // 3 min atrás (recente)
      },
      {
        id: '26',
        sender: 'operador',
        content: 'Já separei o produto correto. Envio hoje e coleto o errado.',
        timestamp: new Date(Date.now() - 120000) // 2 min atrás
      }
    ]
  },

  // ⚪ CENÁRIO 8-12: Chats Normais (normal)
  {
    clientId: 'CHAT008',
    channel: 'whatsapp',
    isAIActive: true,
    messages: [
      {
        id: '27',
        sender: 'client',
        content: 'Olá! Tudo bem?',
        timestamp: new Date(Date.now() - 300000) // 5 min atrás
      },
      {
        id: '28',
        sender: 'IA',
        content: 'Olá! Tudo ótimo! Como posso te ajudar?',
        timestamp: new Date(Date.now() - 240000)
      },
      {
        id: '29',
        sender: 'client',
        content: 'Queria saber sobre frete grátis',
        timestamp: new Date(Date.now() - 180000)
      },
      {
        id: '30',
        sender: 'IA',
        content: 'Frete grátis para compras acima de R$ 150!',
        timestamp: new Date(Date.now() - 120000)
      },
      {
        id: '31',
        sender: 'client',
        content: 'Perfeito! Obrigado!',
        timestamp: new Date(Date.now() - 60000) // 1 min atrás
      }
    ]
  },

  {
    clientId: 'CHAT009',
    channel: 'web',
    isAIActive: false,
    operatorName: 'Fernanda Silva',
    messages: [
      {
        id: '32',
        sender: 'client',
        content: 'Como faço para trocar um produto?',
        timestamp: new Date(Date.now() - 600000)
      },
      {
        id: '33',
        sender: 'operador',
        content: 'Oi! Para trocas, você tem 30 dias. Precisa estar na embalagem original.',
        timestamp: new Date(Date.now() - 540000)
      },
      {
        id: '34',
        sender: 'client',
        content: 'Ok, está na embalagem. Como proceder?',
        timestamp: new Date(Date.now() - 480000)
      },
      {
        id: '35',
        sender: 'operador',
        content: 'Vou gerar uma etiqueta de devolução. Te envio por email.',
        timestamp: new Date(Date.now() - 420000)
      },
      {
        id: '36',
        sender: 'client',
        content: 'Perfeito! Aguardo.',
        timestamp: new Date(Date.now() - 300000)
      }
    ]
  },

  {
    clientId: 'CHAT010',
    channel: 'telegram',
    isAIActive: true,
    messages: [
      {
        id: '37',
        sender: 'client',
        content: 'Posso parcelar minha compra?',
        timestamp: new Date(Date.now() - 480000)
      },
      {
        id: '38',
        sender: 'IA',
        content: 'Sim! Parcelo em até 12x sem juros no cartão.',
        timestamp: new Date(Date.now() - 420000)
      },
      {
        id: '39',
        sender: 'client',
        content: 'Ótimo! Vou finalizar a compra então.',
        timestamp: new Date(Date.now() - 360000)
      },
      {
        id: '40',
        sender: 'IA',
        content: 'Perfeito! Qualquer dúvida, estou aqui.',
        timestamp: new Date(Date.now() - 300000)
      }
    ]
  },

  // Chat vazio para teste
  {
    clientId: 'CHAT011',
    channel: 'email',
    isAIActive: true,
    messages: []
  },

  // Chat com apenas 1 mensagem
  {
    clientId: 'CHAT012',
    channel: 'whatsapp',
    isAIActive: false,
    messages: [
      {
        id: '41',
        sender: 'client',
        content: 'Oi, primeira vez aqui!',
        timestamp: new Date(Date.now() - 120000)
      }
    ]
  },

  // 🔴 CENÁRIO 13: Chamada Urgente com Histórico
  {
    clientId: 'CHAT013',
    channel: 'web',
    isAIActive: false,
    operatorName: 'Roberto Santos',
    messages: [
      {
        id: '42',
        sender: 'client',
        content: 'Vocês cobraram meu cartão 3 vezes!',
        timestamp: new Date(Date.now() - 900000) // 15 min atrás
      },
      {
        id: '43',
        sender: 'IA',
        content: 'Isso é sério! Vou verificar suas transações.',
        timestamp: new Date(Date.now() - 840000)
      },
      {
        id: '44',
        sender: 'client',
        content: 'Preciso de uma solução AGORA! É muito dinheiro!',
        timestamp: new Date(Date.now() - 720000)
      },
      {
        id: '45',
        sender: 'IA',
        content: 'Entendo sua preocupação. Vou conectar com um especialista.',
        timestamp: new Date(Date.now() - 600000)
      },
      {
        id: '46',
        sender: 'client',
        content: 'JÁ FAZ 10 MINUTOS! QUERO FALAR COM GERENTE!',
        timestamp: new Date(Date.now() - 300000) // 5 min atrás
      }
    ]
  },

  // 🟡 CENÁRIO 14: Problema Não Resolvido - Cliente Irritado
  {
    clientId: 'CHAT014',
    channel: 'whatsapp',
    isAIActive: false,
    operatorName: 'Juliana Costa',
    messages: [
      {
        id: '47',
        sender: 'client',
        content: 'Meu produto não chegou na data prometida',
        timestamp: new Date(Date.now() - 2400000) // 40 min atrás
      },
      {
        id: '48',
        sender: 'operador',
        content: 'Oi! Sinto muito pelo atraso. Vou rastrear seu pedido.',
        timestamp: new Date(Date.now() - 2340000)
      },
      {
        id: '49',
        sender: 'operador',
        content: 'Encontrei o problema. Houve atraso na transportadora.',
        timestamp: new Date(Date.now() - 2280000)
      },
      {
        id: '50',
        sender: 'client',
        content: 'Não me interessa! Prometeram para hoje e não chegou!',
        timestamp: new Date(Date.now() - 2100000)
      },
      {
        id: '51',
        sender: 'operador',
        content: 'Infelizmente não tenho como acelerar a entrega. Posso oferecer um desconto.',
        timestamp: new Date(Date.now() - 1800000)
      },
      {
        id: '52',
        sender: 'client',
        content: 'Não quero desconto! Quero meu produto! Vocês são incompetentes!',
        timestamp: new Date(Date.now() - 1500000) // 25 min atrás
      }
    ]
  }
]
