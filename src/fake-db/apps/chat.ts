// Type Imports
import type { ChatDataType } from '@/types/chatTypes'

// 🔥 CORRIGIDO: Função para criar timestamps consistentes
const createTimestamp = (dateString: string): number => {
  return new Date(dateString).getTime()
}

// Timestamps para datas relativas (ontem, anteontem, etc.)
const now = Date.now()
const previousDay = now - 24 * 60 * 60 * 1000 // Ontem
const dayBeforePreviousDay = now - 2 * 24 * 60 * 60 * 1000 // Anteontem

// 🔥 CORRIGIDO: Dados do chat com timestamps serializáveis
export const db: ChatDataType = {
  profileUser: {
    id: 1,
    avatar: '/images/avatars/1.png',
    fullName: 'João Silva',
    role: 'Administrador',
    about: 'Administrador do sistema de chat e monitoramento de atendimento.',
    status: 'online',
    settings: {
      isTwoStepAuthVerificationEnabled: true,
      isNotificationsOn: false
    }
  },
  contacts: [
    {
      id: 2,
      fullName: 'Maria Santos',
      role: 'Desenvolvedora Frontend',
      about: 'Especialista em React e TypeScript. Apaixonada por criar interfaces elegantes.',
      avatar: '/images/avatars/2.png',
      status: 'offline'
    },
    {
      id: 3,
      fullName: 'Carlos Oliveira',
      role: 'Designer UI/UX',
      avatarColor: 'primary',
      about: 'Designer focado em experiência do usuário e interfaces intuitivas.',
      status: 'busy'
    },
    {
      id: 4,
      fullName: 'Ana Costa',
      role: 'Planejadora Urbana',
      about: 'Especialista em planejamento urbano e desenvolvimento sustentável.',
      avatar: '/images/avatars/8.png',
      status: 'busy'
    },
    {
      id: 5,
      fullName: 'Pedro Almeida',
      role: 'Nutricionista',
      avatarColor: 'success',
      about: 'Nutricionista com foco em alimentação saudável e sustentável.',
      status: 'busy'
    },
    {
      id: 6,
      avatarColor: 'warning',
      fullName: 'Lucia Fernandes',
      role: 'Designer de Produção',
      about: 'Designer especializada em produção audiovisual e cenografia.',
      status: 'offline'
    },
    {
      id: 7,
      fullName: 'Roberto Silva',
      role: 'Executivo de Marketing',
      about: 'Estrategista de marketing digital com foco em crescimento orgânico.',
      avatarColor: 'info',
      status: 'online'
    },
    {
      id: 8,
      fullName: 'Fernanda Lima',
      role: 'Professora de Educação Especial',
      about: 'Educadora dedicada ao ensino inclusivo e desenvolvimento de metodologias adaptativas.',
      avatar: '/images/avatars/7.png',
      status: 'online'
    },
    {
      id: 9,
      fullName: 'Diego Mendes',
      role: 'Redator Publicitário',
      about: 'Copywriter criativo especializado em campanhas digitais e storytelling.',
      avatarColor: 'error',
      status: 'online'
    },
    {
      id: 10,
      fullName: 'Camila Torres',
      role: 'Engenheira Civil',
      about: 'Engenheira especializada em construção sustentável e eficiência energética.',
      avatar: '/images/avatars/4.png',
      status: 'away'
    },
    {
      id: 11,
      fullName: 'Rafael Souza',
      role: 'Desenvolvedor Full Stack',
      about: 'Desenvolvedor experiente em Node.js, React e arquitetura de sistemas.',
      avatar: '/images/avatars/5.png',
      status: 'online'
    },
    {
      id: 16,
      fullName: 'Laura Monteiro',
      role: 'Especialista em IA',
      about: 'Pesquisadora em inteligência artificial e machine learning aplicado.',
      avatarColor: 'warning',
      status: 'online'
    },
    {
      id: 17,
      fullName: 'Vitor Cardoso',
      role: 'Cientista de Dados',
      about: 'Analista de dados especializado em Big Data e visualização de informações.',
      avatar: '/images/avatars/3.png',
      status: 'online'
    }
  ],
  chats: [
    {
      id: 1,
      userId: 2,
      unseenMsgs: 1,
      chat: [
        {
          message: 'Como podemos ajudar? Estamos aqui para você!',
          time: createTimestamp('2024-12-10T07:45:00Z'), // ✅ Timestamp
          senderId: 1,
          msgStatus: {
            isSent: true,
            isDelivered: true,
            isSeen: true
          }
        },
        {
          message: 'Olá João! Estou procurando o melhor template de admin. Você pode me ajudar a encontrar?',
          time: createTimestamp('2024-12-10T07:45:23Z'), // ✅ Timestamp
          senderId: 2
        },
        {
          message: 'Precisa ser compatível com MUI v5.',
          time: createTimestamp('2024-12-10T07:45:55Z'), // ✅ Timestamp
          senderId: 2,
          msgStatus: {
            isSent: true,
            isDelivered: true,
            isSeen: true
          }
        },
        {
          message: 'Claro! Temos exatamente o que você precisa.',
          time: createTimestamp('2024-12-10T07:46:00Z'), // ✅ Timestamp
          senderId: 1,
          msgStatus: {
            isSent: true,
            isDelivered: true,
            isSeen: true
          }
        },
        {
          message: 'Nosso template é construído com MUI! 🎉',
          time: createTimestamp('2024-12-10T07:46:05Z'), // ✅ Timestamp
          senderId: 1,
          msgStatus: {
            isSent: true,
            isDelivered: true,
            isSeen: true
          }
        },
        {
          message: 'Parece uma interface limpa e moderna. 😍',
          time: createTimestamp('2024-12-10T07:46:23Z'), // ✅ Timestamp
          senderId: 2
        },
        {
          message: 'É perfeito para meu próximo projeto.',
          time: createTimestamp('2024-12-10T07:46:33Z'), // ✅ Timestamp
          senderId: 2
        },
        {
          message: 'Como posso comprá-lo?',
          time: createTimestamp('2024-12-10T07:46:43Z'), // ✅ Timestamp
          senderId: 2
        },
        {
          message: 'Obrigado! Você pode adquirir em nosso site oficial 😇',
          time: createTimestamp('2024-12-10T07:46:53Z'), // ✅ Timestamp
          senderId: 1,
          msgStatus: {
            isSent: true,
            isDelivered: true,
            isSeen: true
          }
        },
        {
          message: 'Vou comprar com certeza! 👍',
          time: previousDay, // ✅ Timestamp relativo (ontem)
          senderId: 2
        }
      ]
    },
    {
      id: 2,
      userId: 3,
      unseenMsgs: 0,
      chat: [
        {
          message: 'Oi!',
          time: createTimestamp('2024-12-10T07:45:00Z'), // ✅ Timestamp
          senderId: 1,
          msgStatus: {
            isSent: true,
            isDelivered: true,
            isSeen: true
          }
        },
        {
          message: 'Olá! Como posso ajudá-lo?',
          time: createTimestamp('2024-12-11T07:45:15Z'), // ✅ Timestamp
          senderId: 3
        },
        {
          message: 'Posso obter detalhes da minha última transação do mês passado? 🤔',
          time: createTimestamp('2024-12-11T07:46:10Z'), // ✅ Timestamp
          senderId: 1,
          msgStatus: {
            isSent: true,
            isDelivered: true,
            isSeen: true
          }
        },
        {
          message: 'Precisamos verificar se podemos fornecer essas informações.',
          time: createTimestamp('2024-12-11T07:45:15Z'), // ✅ Timestamp
          senderId: 3
        },
        {
          message: 'Te informo assim que tiver uma atualização.',
          time: createTimestamp('2024-12-11T07:46:15Z'), // ✅ Timestamp
          senderId: 3
        },
        {
          message: 'Se demorar, você pode me enviar um email.',
          time: dayBeforePreviousDay, // ✅ Timestamp relativo (anteontem)
          senderId: 1,
          msgStatus: {
            isSent: true,
            isDelivered: false,
            isSeen: false
          }
        }
      ]
    },
    {
      id: 3,
      userId: 10,
      unseenMsgs: 0,
      chat: [
        {
          message: 'Olá, sou engenheira civil e gostaria de agendar uma vistoria no seu edifício.',
          time: createTimestamp('2024-12-13T11:00:00Z'), // ✅ Timestamp
          senderId: 10
        },
        {
          message: 'Claro! Pode me dar mais detalhes sobre a vistoria?',
          time: createTimestamp('2024-12-13T11:01:00Z'), // ✅ Timestamp
          senderId: 1
        },
        {
          message:
            'A vistoria incluirá uma inspeção completa para avaliar as condições e identificar possíveis problemas.',
          time: createTimestamp('2024-12-13T11:02:00Z'), // ✅ Timestamp
          senderId: 10
        },
        {
          message: 'Perfeito! Quando planeja realizar a vistoria?',
          time: createTimestamp('2024-12-13T11:03:00Z'), // ✅ Timestamp
          senderId: 1
        },
        {
          message: 'Estou disponível na próxima semana. Funciona para você?',
          time: createTimestamp('2024-12-13T11:04:00Z'), // ✅ Timestamp
          senderId: 10
        },
        {
          message: 'Sim, perfeito! Vamos agendar para quarta-feira.',
          time: createTimestamp('2024-12-13T11:05:00Z'), // ✅ Timestamp
          senderId: 1
        },
        {
          message: 'Ótimo! Enviarei um email de confirmação com os detalhes.',
          time: createTimestamp('2024-12-13T11:06:00Z'), // ✅ Timestamp
          senderId: 10
        },
        {
          message: 'Obrigado, estou ansioso!',
          time: createTimestamp('2024-12-13T11:07:00Z'), // ✅ Timestamp
          senderId: 1
        }
      ]
    },
    {
      id: 4,
      userId: 8,
      unseenMsgs: 0,
      chat: [
        {
          message: 'Olá! Gostaria de agendar uma reunião profissional.',
          time: createTimestamp('2024-12-10T07:45:00Z'), // ✅ Timestamp
          senderId: 1,
          msgStatus: {
            isSent: true,
            isDelivered: true,
            isSeen: true
          }
        },
        {
          message: 'Claro! Pode me dar mais detalhes sobre a reunião?',
          time: createTimestamp('2024-12-11T07:45:15Z'), // ✅ Timestamp
          senderId: 8
        },
        {
          message: 'A reunião é sobre nosso próximo plano de projeto.',
          time: createTimestamp('2024-12-11T07:46:10Z'), // ✅ Timestamp
          senderId: 1,
          msgStatus: {
            isSent: true,
            isDelivered: true,
            isSeen: true
          }
        },
        {
          message: 'Perfeito! Vou preparar os documentos necessários.',
          time: createTimestamp('2024-12-11T07:45:15Z'), // ✅ Timestamp
          senderId: 8
        },
        {
          message: 'Obrigado, estou ansioso pela reunião!',
          time: createTimestamp('2024-12-11T07:46:15Z'), // ✅ Timestamp
          senderId: 1
        }
      ]
    },
    {
      id: 5,
      userId: 16,
      unseenMsgs: 0,
      chat: [
        {
          message: 'Ei, você ouviu falar sobre o novo modelo de IA GPT-4?',
          time: createTimestamp('2024-12-13T09:00:00Z'), // ✅ Timestamp
          senderId: 16
        },
        {
          message: 'Não, ainda não. O que há de novo sobre ele?',
          time: createTimestamp('2024-12-13T09:01:00Z'), // ✅ Timestamp
          senderId: 1
        },
        {
          message: 'Supostamente é ainda mais poderoso e preciso que o GPT-3. Pode gerar textos ainda mais realistas.',
          time: createTimestamp('2024-12-13T09:02:00Z'), // ✅ Timestamp
          senderId: 16
        },
        {
          message: 'Isso parece interessante. Vou dar uma olhada.',
          time: createTimestamp('2024-12-13T09:03:00Z'), // ✅ Timestamp
          senderId: 1
        }
      ]
    },
    {
      id: 6,
      userId: 11,
      unseenMsgs: 1,
      chat: [
        {
          message: 'Ei, você pensou sobre os planos futuros da nossa empresa?',
          time: createTimestamp('2024-12-13T10:00:00Z'), // ✅ Timestamp
          senderId: 1
        },
        {
          message: 'Sim, tenho pensado. Precisamos focar em IA e machine learning.',
          time: createTimestamp('2024-12-13T10:01:00Z'), // ✅ Timestamp
          senderId: 11
        },
        {
          message: 'Concordo. Essas tecnologias são o futuro. Também devemos considerar investir em cloud computing.',
          time: createTimestamp('2024-12-13T10:02:00Z'), // ✅ Timestamp
          senderId: 1
        },
        {
          message: 'Absolutamente! Cloud computing nos dará a flexibilidade e escalabilidade que precisamos.',
          time: createTimestamp('2024-12-13T10:03:00Z'), // ✅ Timestamp
          senderId: 11
        },
        {
          message: 'Também devemos pensar em expandir nossa equipe. Precisaremos de mais talentos.',
          time: createTimestamp('2024-12-13T10:04:00Z'), // ✅ Timestamp
          senderId: 1
        },
        {
          message: 'Sim, contratar as pessoas certas é crucial. Devemos começar a buscar candidatos o quanto antes.',
          time: createTimestamp('2024-12-13T10:05:00Z'), // ✅ Timestamp
          senderId: 11
        },
        {
          message: 'Ótimo! Vamos começar a trabalhar em um plano então.',
          time: createTimestamp('2024-12-13T10:06:00Z'), // ✅ Timestamp
          senderId: 1
        },
        {
          message: 'Perfeito! Vamos fazer isso! 🚀',
          time: createTimestamp('2024-12-13T10:07:00Z'), // ✅ Timestamp
          senderId: 11
        }
      ]
    }
  ]
}
