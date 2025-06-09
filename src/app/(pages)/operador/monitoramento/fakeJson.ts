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

// JSON com dados mockados mais completos
export const clientsData: ClientData[] = [
  {
    clientId: '123',
    channel: 'web',
    isAIActive: false,
    operatorName: 'João Silva',
    messages: [
      {
        id: '1',
        sender: 'client',
        content: 'Olá, preciso de ajuda com meu pedido',
        timestamp: new Date(Date.now() - 300000)
      },
      {
        id: '2',
        sender: 'IA',
        content: 'Olá! Posso te ajudar com informações sobre seu pedido. Qual é o número do pedido?',
        timestamp: new Date(Date.now() - 240000)
      },
      {
        id: '3',
        sender: 'client',
        content: 'É o pedido #12345',
        timestamp: new Date(Date.now() - 180000)
      },
      {
        id: '4',
        sender: 'operador',
        content: 'Oi! Sou o João, vou te ajudar. Vejo que seu pedido está sendo preparado e será enviado hoje.',
        timestamp: new Date(Date.now() - 120000)
      },
      {
        id: '5',
        sender: 'client',
        content: 'Perfeito! Muito obrigado!',
        timestamp: new Date(Date.now() - 60000)
      }
    ]
  },
  {
    clientId: '456',
    channel: 'whatsapp',
    isAIActive: true,
    messages: [
      {
        id: '6',
        sender: 'client',
        content: 'Quero cancelar minha assinatura',
        timestamp: new Date(Date.now() - 180000)
      },
      {
        id: '7',
        sender: 'IA',
        content: 'Entendo que você deseja cancelar. Posso te ajudar com isso. Qual o motivo do cancelamento?',
        timestamp: new Date(Date.now() - 120000)
      },
      {
        id: '8',
        sender: 'client',
        content: 'Não estou usando mais o serviço',
        timestamp: new Date(Date.now() - 60000)
      },
      {
        id: '9',
        sender: 'IA',
        content: 'Entendi. Posso processar o cancelamento para você. Confirma que deseja prosseguir?',
        timestamp: new Date(Date.now() - 30000)
      }
    ]
  },
  {
    clientId: '789',
    channel: 'telegram',
    isAIActive: false,
    operatorName: 'Maria Santos',
    messages: []
  },
  {
    clientId: '101',
    channel: 'email',
    isAIActive: true,
    operatorName: 'Carlos Lima',
    messages: [
      {
        id: '10',
        sender: 'client',
        content: 'Recebi um produto com defeito, como proceder?',
        timestamp: new Date(Date.now() - 600000)
      },
      {
        id: '11',
        sender: 'IA',
        content:
          'Lamento pelo inconveniente. Posso te ajudar com a troca do produto. Você pode me enviar fotos do defeito?',
        timestamp: new Date(Date.now() - 540000)
      },
      {
        id: '12',
        sender: 'client',
        content: 'Claro, vou enviar as fotos agora',
        timestamp: new Date(Date.now() - 480000)
      }
    ]
  },
  {
    clientId: '200',
    channel: 'whatsapp',
    isAIActive: false,
    operatorName: 'Ana Costa',
    messages: [
      {
        id: '13',
        sender: 'client',
        content: 'Quando vai chegar meu pedido?',
        timestamp: new Date(Date.now() - 900000)
      },
      {
        id: '14',
        sender: 'operador',
        content: 'Oi! Sou a Ana. Vou verificar o status do seu pedido agora mesmo.',
        timestamp: new Date(Date.now() - 840000)
      },
      {
        id: '15',
        sender: 'operador',
        content: 'Seu pedido saiu para entrega hoje pela manhã. Deve chegar até às 18h.',
        timestamp: new Date(Date.now() - 780000)
      },
      {
        id: '16',
        sender: 'client',
        content: 'Ótimo! Obrigado pela informação.',
        timestamp: new Date(Date.now() - 720000)
      }
    ]
  },
  {
    clientId: '202',
    channel: 'whatsapp',
    isAIActive: false,
    operatorName: 'Ana Costa',
    messages: [
      {
        id: '13',
        sender: 'client',
        content: 'Quando vai chegar meu pedido?',
        timestamp: new Date(Date.now() - 900000)
      },
      {
        id: '14',
        sender: 'operador',
        content: 'Oi! Sou a Ana. Vou verificar o status do seu pedido agora mesmo.',
        timestamp: new Date(Date.now() - 840000)
      },
      {
        id: '15',
        sender: 'operador',
        content: 'Seu pedido saiu para entrega hoje pela manhã. Deve chegar até às 18h.',
        timestamp: new Date(Date.now() - 780000)
      },
      {
        id: '16',
        sender: 'client',
        content: 'Ótimo! Obrigado pela informação.',
        timestamp: new Date(Date.now() - 720000)
      }
    ]
  },
  {
    clientId: '204',
    channel: 'whatsapp',
    isAIActive: false,
    operatorName: 'Ana Costa',
    messages: [
      {
        id: '13',
        sender: 'client',
        content: 'Quando vai chegar meu pedido?',
        timestamp: new Date(Date.now() - 900000)
      },
      {
        id: '14',
        sender: 'operador',
        content: 'Oi! Sou a Ana. Vou verificar o status do seu pedido agora mesmo.',
        timestamp: new Date(Date.now() - 840000)
      },
      {
        id: '15',
        sender: 'operador',
        content: 'Seu pedido saiu para entrega hoje pela manhã. Deve chegar até às 18h.',
        timestamp: new Date(Date.now() - 780000)
      },
      {
        id: '16',
        sender: 'client',
        content: 'Ótimo! Obrigado pela informação.',
        timestamp: new Date(Date.now() - 720000)
      }
    ]
  },
  {
    clientId: '206',
    channel: 'whatsapp',
    isAIActive: false,
    operatorName: 'Ana Costa',
    messages: [
      {
        id: '13',
        sender: 'client',
        content: 'Quando vai chegar meu pedido?',
        timestamp: new Date(Date.now() - 900000)
      },
      {
        id: '14',
        sender: 'operador',
        content: 'Oi! Sou a Ana. Vou verificar o status do seu pedido agora mesmo.',
        timestamp: new Date(Date.now() - 840000)
      },
      {
        id: '15',
        sender: 'operador',
        content: 'Seu pedido saiu para entrega hoje pela manhã. Deve chegar até às 18h.',
        timestamp: new Date(Date.now() - 780000)
      },
      {
        id: '16',
        sender: 'client',
        content: 'Ótimo! Obrigado pela informação.',
        timestamp: new Date(Date.now() - 720000)
      }
    ]
  },
  {
    clientId: '208',
    channel: 'whatsapp',
    isAIActive: false,
    operatorName: 'Ana Costa',
    messages: [
      {
        id: '13',
        sender: 'client',
        content: 'Quando vai chegar meu pedido?',
        timestamp: new Date(Date.now() - 900000)
      },
      {
        id: '14',
        sender: 'operador',
        content: 'Oi! Sou a Ana. Vou verificar o status do seu pedido agora mesmo.',
        timestamp: new Date(Date.now() - 840000)
      },
      {
        id: '15',
        sender: 'operador',
        content: 'Seu pedido saiu para entrega hoje pela manhã. Deve chegar até às 18h.',
        timestamp: new Date(Date.now() - 780000)
      },
      {
        id: '16',
        sender: 'client',
        content: 'Ótimo! Obrigado pela informação.',
        timestamp: new Date(Date.now() - 720000)
      }
    ]
  },
  {
    clientId: '303',
    channel: 'web',
    isAIActive: true,
    messages: [
      {
        id: '17',
        sender: 'client',
        content: 'Como faço para alterar meu endereço de entrega?',
        timestamp: new Date(Date.now() - 420000)
      },
      {
        id: '18',
        sender: 'IA',
        content: 'Posso te ajudar com isso! Para alterar o endereço, acesse "Minha Conta" > "Endereços" no site.',
        timestamp: new Date(Date.now() - 360000)
      }
    ]
  },
  {
    clientId: '404',
    channel: 'telegram',
    isAIActive: true,
    operatorName: 'Pedro Oliveira',
    messages: [
      {
        id: '19',
        sender: 'client',
        content: 'Não consigo fazer login na minha conta',
        timestamp: new Date(Date.now() - 1200000)
      },
      {
        id: '20',
        sender: 'IA',
        content: 'Vou te ajudar a recuperar o acesso. Você lembra qual email usou no cadastro?',
        timestamp: new Date(Date.now() - 1140000)
      },
      {
        id: '21',
        sender: 'client',
        content: 'Sim, é joao@email.com',
        timestamp: new Date(Date.now() - 1080000)
      },
      {
        id: '22',
        sender: 'operador',
        content: 'Oi João! Sou o Pedro. Enviei um link de redefinição de senha para seu email.',
        timestamp: new Date(Date.now() - 1020000)
      }
    ]
  },
  {
    clientId: '505',
    channel: 'email',
    isAIActive: false,
    messages: [
      {
        id: '23',
        sender: 'client',
        content: 'Gostaria de saber sobre os planos disponíveis',
        timestamp: new Date(Date.now() - 1500000)
      }
    ]
  },
  {
    clientId: '606',
    channel: 'whatsapp',
    isAIActive: true,
    messages: [
      {
        id: '24',
        sender: 'client',
        content: 'Olá! Tudo bem?',
        timestamp: new Date(Date.now() - 180000)
      },
      {
        id: '25',
        sender: 'IA',
        content: 'Olá! Tudo ótimo, obrigado! Como posso te ajudar hoje?',
        timestamp: new Date(Date.now() - 120000)
      },
      {
        id: '26',
        sender: 'client',
        content: 'Queria tirar uma dúvida sobre frete grátis',
        timestamp: new Date(Date.now() - 60000)
      },
      {
        id: '27',
        sender: 'IA',
        content: 'Claro! O frete grátis é válido para compras acima de R$ 150 em todo o Brasil.',
        timestamp: new Date(Date.now() - 30000)
      }
    ]
  }
]
