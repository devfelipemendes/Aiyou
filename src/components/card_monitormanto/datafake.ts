// chatFakeData.ts
export const chatFakeData = {
  profileUser: {
    id: 1,
    fullName: 'Alex Santos',
    avatar: 'https://ui-avatars.com/api/?name=Alex+Santos&background=0ea5e9&color=fff&size=128'
  },
  activeChat: {
    userId: 2,
    userInfo: {
      id: 2,
      fullName: 'Marina Costa',
      avatar: 'https://ui-avatars.com/api/?name=Marina+Costa&background=f59e0b&color=fff&size=128'
    },
    messages: [
      {
        senderId: 2,
        time: '2024-07-16T08:30:00Z',
        message: 'Bom dia, Alex! Tudo bem?',
        msgStatus: {
          isSent: true,
          isDelivered: true,
          isSeen: true
        }
      },
      {
        senderId: 1,
        time: '2024-07-16T08:32:00Z',
        message: 'Oi Marina! Tudo ótimo, obrigado! 😊',
        msgStatus: {
          isSent: true,
          isDelivered: true,
          isSeen: true
        }
      },
      {
        senderId: 1,
        time: '2024-07-16T08:32:30Z',
        message: 'Como foi o final de semana?',
        msgStatus: {
          isSent: true,
          isDelivered: true,
          isSeen: true
        }
      },
      {
        senderId: 2,
        time: '2024-07-16T08:35:00Z',
        message: 'Foi incrível! Fui à praia com a família.',
        msgStatus: {
          isSent: true,
          isDelivered: true,
          isSeen: true
        }
      },
      {
        senderId: 2,
        time: '2024-07-16T08:35:15Z',
        message: 'O tempo estava perfeito ☀️',
        msgStatus: {
          isSent: true,
          isDelivered: true,
          isSeen: true
        }
      },
      {
        senderId: 2,
        time: '2024-07-16T08:35:45Z',
        message: 'E você? Fez algo legal?',
        msgStatus: {
          isSent: true,
          isDelivered: true,
          isSeen: true
        }
      },
      {
        senderId: 1,
        time: '2024-07-16T08:40:00Z',
        message: 'Que legal! Eu fiquei em casa mesmo, aproveitei para descansar e ler um livro.',
        msgStatus: {
          isSent: true,
          isDelivered: true,
          isSeen: true
        }
      },
      {
        senderId: 2,
        time: '2024-07-16T08:42:00Z',
        message: 'Que livro estava lendo?',
        msgStatus: {
          isSent: true,
          isDelivered: true,
          isSeen: true
        }
      },
      {
        senderId: 1,
        time: '2024-07-16T08:45:00Z',
        message: '"Sapiens" do Yuval Noah Harari. Recomendo muito! 📚',
        msgStatus: {
          isSent: true,
          isDelivered: true,
          isSeen: true
        }
      },
      {
        senderId: 1,
        time: '2024-07-16T08:45:30Z',
        message: 'É sobre a história da humanidade, muito interessante!',
        msgStatus: {
          isSent: true,
          isDelivered: true,
          isSeen: true
        }
      },
      {
        senderId: 2,
        time: '2024-07-16T08:48:00Z',
        message: 'Ah, já ouvi falar! Vou colocar na minha lista de leitura.',
        msgStatus: {
          isSent: true,
          isDelivered: true,
          isSeen: true
        }
      },
      {
        senderId: 2,
        time: '2024-07-16T08:48:30Z',
        message: 'Aliás, a propósito da reunião de hoje...',
        msgStatus: {
          isSent: true,
          isDelivered: true,
          isSeen: true
        }
      },
      {
        senderId: 1,
        time: '2024-07-16T08:50:00Z',
        message: 'Sim! Já preparei todos os documentos que você pediu.',
        msgStatus: {
          isSent: true,
          isDelivered: true,
          isSeen: true
        }
      },
      {
        senderId: 1,
        time: '2024-07-16T08:50:15Z',
        message: 'Enviei por email também, mas posso levar impressos.',
        msgStatus: {
          isSent: true,
          isDelivered: true,
          isSeen: true
        }
      },
      {
        senderId: 2,
        time: '2024-07-16T08:52:00Z',
        message: 'Perfeito! Você é sempre muito organizado 👏',
        msgStatus: {
          isSent: true,
          isDelivered: true,
          isSeen: false
        }
      },
      {
        senderId: 1,
        time: '2024-07-16T08:55:00Z',
        message: 'Haha, obrigado! A organização é fundamental para tudo dar certo.',
        msgStatus: {
          isSent: true,
          isDelivered: true,
          isSeen: false
        }
      },
      {
        senderId: 2,
        time: '2024-07-16T08:58:00Z',
        message: 'Concordo totalmente!',
        msgStatus: {
          isSent: true,
          isDelivered: false,
          isSeen: false
        }
      },
      {
        senderId: 1,
        time: '2024-07-16T09:00:00Z',
        message: 'Então nos vemos às 14h na sala de reuniões?',
        msgStatus: {
          isSent: true,
          isDelivered: false,
          isSeen: false
        }
      },
      {
        senderId: 2,
        time: '2024-07-16T09:02:00Z',
        message: 'Sim! Até lá! 🤝',
        msgStatus: {
          isSent: false,
          isDelivered: false,
          isSeen: false
        }
      }
    ]
  }
}

// ===== DADOS FAKE ALTERNATIVOS =====
export const chatFakeDataVariation1 = {
  profileUser: {
    id: 1,
    fullName: 'Carlos Lima'

    // Sem avatar para testar iniciais
  },
  activeChat: {
    userId: 3,
    userInfo: {
      id: 3,
      fullName: 'Ana Beatriz',
      avatar: 'https://ui-avatars.com/api/?name=Ana+Beatriz&background=10b981&color=fff&size=128'
    },
    messages: [
      {
        senderId: 3,
        time: '2024-07-16T10:00:00Z',
        message: 'Carlos, conseguiu terminar o relatório?',
        msgStatus: {
          isSent: true,
          isDelivered: true,
          isSeen: true
        }
      },
      {
        senderId: 1,
        time: '2024-07-16T10:05:00Z',
        message: 'Sim! Acabei de finalizar. Quer que eu envie agora?',
        msgStatus: {
          isSent: true,
          isDelivered: true,
          isSeen: true
        }
      },
      {
        senderId: 3,
        time: '2024-07-16T10:06:00Z',
        message: 'Por favor! Preciso revisar antes da apresentação.',
        msgStatus: {
          isSent: true,
          isDelivered: true,
          isSeen: false
        }
      }
    ]
  }
}

// ===== DADOS FAKE COM MENSAGENS LONGAS =====
export const chatFakeDataLongMessages = {
  profileUser: {
    id: 1,
    fullName: 'Pedro Silva',
    avatar: 'https://ui-avatars.com/api/?name=Pedro+Silva&background=dc2626&color=fff&size=128'
  },
  activeChat: {
    userId: 4,
    userInfo: {
      id: 4,
      fullName: 'Juliana Oliveira',
      avatar: 'https://ui-avatars.com/api/?name=Juliana+Oliveira&background=7c3aed&color=fff&size=128'
    },
    messages: [
      {
        senderId: 4,
        time: '2024-07-16T11:00:00Z',
        message:
          'Pedro, estava pensando sobre nossa conversa de ontem sobre a implementação do novo sistema. Acho que precisamos considerar alguns pontos importantes antes de seguirmos em frente com o desenvolvimento.',
        msgStatus: {
          isSent: true,
          isDelivered: true,
          isSeen: true
        }
      },
      {
        senderId: 1,
        time: '2024-07-16T11:03:00Z',
        message: 'Concordo! Quais pontos específicos você gostaria de abordar?',
        msgStatus: {
          isSent: true,
          isDelivered: true,
          isSeen: true
        }
      },
      {
        senderId: 4,
        time: '2024-07-16T11:05:00Z',
        message:
          'Principalmente a questão da segurança e da escalabilidade. Precisamos garantir que o sistema suporte um grande número de usuários simultâneos e que os dados estejam sempre protegidos.',
        msgStatus: {
          isSent: true,
          isDelivered: true,
          isSeen: false
        }
      }
    ]
  }
}

// ===== FUNÇÃO HELPER PARA GERAR MENSAGENS ALEATÓRIAS =====
