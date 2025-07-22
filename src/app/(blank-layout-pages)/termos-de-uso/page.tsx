'use client'
import React from 'react'

import { Container, Paper, Typography, Box, Divider, useTheme, Button } from '@mui/material'
import { styled } from '@mui/material/styles'
import { DownloadIcon } from 'lucide-react'

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.mode === 'light' ? '#fafafa' : '#474360',
  '& .MuiTypography-h4': {
    color: theme.palette.primary.main,
    fontWeight: 600,
    marginBottom: theme.spacing(3),
    textAlign: 'center'
  },
  '& .MuiTypography-h5': {
    color: theme.palette.primary.dark,
    fontWeight: 500,
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2)
  },
  '& .MuiTypography-body1': {
    lineHeight: 1.8,
    textAlign: 'justify',
    marginBottom: theme.spacing(2)
  }
}))

const CompanyInfo = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.light,
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(3),
  textAlign: 'center'
}))

const SectionBox = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  borderLeft: `4px solid ${theme.palette.primary.main}`,
  backgroundColor: theme.palette.mode === 'light' ? '#fafafa' : '#28243D',
  borderRadius: theme.shape.borderRadius
}))

const TermosDeServicoAIYOU = () => {
  const theme = useTheme()

  const handleDownloadPDF = () => {
    // Aqui você pode implementar o download real do PDF
    // Por enquanto, vou simular o download
    const link = document.createElement('a')

    link.href = 'public/PDF/Termos_de_Servico_AIYOU.pdf' // Substitua pelo caminho real do PDF
    link.download = 'Termos-de-uso.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Container maxWidth='lg'>
      <StyledPaper elevation={3}>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <img
            src='/assets/aiyou-icon.svg'
            alt='AIYOU Logo'
            style={{
              width: '80px',
              height: '80px',
              marginBottom: '16px'
            }}
          />
        </Box>
        <Typography variant='h4' component='h1' gutterBottom>
          TERMO DE SERVIÇO – AIYOU
        </Typography>

        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Button
            variant='contained'
            startIcon={<DownloadIcon />}
            onClick={handleDownloadPDF}
            size='large'
            sx={{
              backgroundColor: theme.palette.primary.main,
              borderRadius: 2,
              px: 3,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 500,
              textTransform: 'none',
              boxShadow: 2,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
                boxShadow: 4
              }
            }}
          >
            Baixar PDF Oficial
          </Button>
        </Box>

        <CompanyInfo>
          <Typography variant='h6' color='white' fontWeight='bold'>
            AIYOU
          </Typography>
          <Typography variant='body2' color='white'>
            CNPJ: 44.255.627/0001-69
          </Typography>
          <Typography variant='body2' color='white'>
            Sede: Brasília-DF
          </Typography>
        </CompanyInfo>

        <SectionBox>
          <Typography variant='h5' component='h2'>
            1. Aceitação dos Termos
          </Typography>
          <Typography variant='body1'>
            Ao acessar ou utilizar os serviços oferecidos pela AIYOU, você concorda com os termos e condições abaixo.
            Caso não concorde, recomendamos que não utilize nossos serviços.
          </Typography>
          <Typography variant='body1'>
            Este Termo rege a relação entre você (usuário, cliente ou parceiro) e a AIYOU, inscrita no CNPJ sob nº
            44.255.627/0001-69 com sede em Brasilia-DF doravante denominada simplesmente &quot;AIYOU&quot;.
          </Typography>
        </SectionBox>

        <SectionBox>
          <Typography variant='h5' component='h2'>
            2. Definições
          </Typography>
          <Typography variant='body1'>
            - <strong>Usuário:</strong> Qualquer pessoa física ou jurídica que utilize os serviços, sistemas ou
            plataformas da AIYOU.
          </Typography>
          <Typography variant='body1'>
            - <strong>Serviços:</strong> Produtos, sistemas, funcionalidades e soluções oferecidas diretamente pela
            AIYOU.
          </Typography>
          <Typography variant='body1'>
            - <strong>Plataforma:</strong> Interface digital acessível via navegador ou aplicativo, desenvolvida e
            mantida pela AIYOU.
          </Typography>
        </SectionBox>

        <SectionBox>
          <Typography variant='h5' component='h2'>
            3. Objeto do Termo
          </Typography>
          <Typography variant='body1'>
            Este Termo regula a prestação dos serviços e o uso da plataforma disponibilizada pela AIYOU. Os serviços
            podem incluir:
          </Typography>
          <Typography variant='body1'>- Atendimento automatizado por IA;</Typography>
          <Typography variant='body1'>- Integrações com sistemas de terceiros;</Typography>
          <Typography variant='body1'>- Emissão e gestão de faturas;</Typography>
          <Typography variant='body1'>- Ferramentas de relacionamento com clientes;</Typography>
          <Typography variant='body1'>
            - Soluções de comunicação (como envio de SMS, notificações, WhatsApp, entre outros);
          </Typography>
          <Typography variant='body1'>- Suporte técnico e operacional.</Typography>
        </SectionBox>

        <SectionBox>
          <Typography variant='h5' component='h2'>
            4. Acesso e Cadastro
          </Typography>
          <Typography variant='body1'>Para utilizar os serviços da AIYOU, o usuário deve:</Typography>
          <Typography variant='body1'>- Ter capacidade legal;</Typography>
          <Typography variant='body1'>- Fornecer dados corretos e atualizados;</Typography>
          <Typography variant='body1'>- Aceitar integralmente este Termo e a Política de Privacidade.</Typography>
          <Typography variant='body1'>
            A responsabilidade pelas informações cadastradas é inteiramente do usuário.
          </Typography>
        </SectionBox>

        <SectionBox>
          <Typography variant='h5' component='h2'>
            5. Responsabilidades da AIYOU
          </Typography>
          <Typography variant='body1'>A AIYOU compromete-se a:</Typography>
          <Typography variant='body1'>
            - Fornecer os serviços contratados com qualidade, segurança e estabilidade;
          </Typography>
          <Typography variant='body1'>- Respeitar e proteger os dados pessoais conforme a LGPD;</Typography>
          <Typography variant='body1'>
            - Manter a plataforma disponível, salvo em casos de manutenções programadas ou falhas técnicas alheias ao
            seu controle;
          </Typography>
          <Typography variant='body1'>- Informar previamente sobre alterações relevantes no serviço.</Typography>
        </SectionBox>

        <SectionBox>
          <Typography variant='h5' component='h2'>
            6. Responsabilidades do Usuário
          </Typography>
          <Typography variant='body1'>O usuário compromete-se a:</Typography>
          <Typography variant='body1'>- Utilizar a plataforma apenas para fins lícitos;</Typography>
          <Typography variant='body1'>- Não tentar invadir, fraudar ou modificar funcionalidades da AIYOU;</Typography>
          <Typography variant='body1'>- Manter a confidencialidade de suas credenciais de acesso;</Typography>
          <Typography variant='body1'>
            - Notificar a AIYOU em caso de uso indevido, suspeita de fraude ou violação de segurança.
          </Typography>
        </SectionBox>

        <SectionBox>
          <Typography variant='h5' component='h2'>
            7. Propriedade Intelectual
          </Typography>
          <Typography variant='body1'>
            Todos os direitos de propriedade intelectual sobre o conteúdo, marca, layout, funcionalidades e código-fonte
            da plataforma pertencem à AIYOU. É proibido:
          </Typography>
          <Typography variant='body1'>- Copiar, modificar ou distribuir qualquer conteúdo sem autorização;</Typography>
          <Typography variant='body1'>
            - Utilizar a marca &quot;AIYOU&quot; ou seus ativos visuais sem permissão expressa.
          </Typography>
        </SectionBox>

        <SectionBox>
          <Typography variant='h5' component='h2'>
            8. Suspensão ou Encerramento de Conta
          </Typography>
          <Typography variant='body1'>
            A AIYOU reserva-se o direito de suspender ou encerrar o acesso do usuário em caso de:
          </Typography>
          <Typography variant='body1'>- Descumprimento deste Termo;</Typography>
          <Typography variant='body1'>- Uso fraudulento ou ilegal da plataforma;</Typography>
          <Typography variant='body1'>- Solicitação judicial ou de autoridade competente.</Typography>
        </SectionBox>

        <SectionBox>
          <Typography variant='h5' component='h2'>
            9. Isenção de Responsabilidade
          </Typography>
          <Typography variant='body1'>A AIYOU não será responsável por:</Typography>
          <Typography variant='body1'>- Danos decorrentes do uso inadequado da plataforma;</Typography>
          <Typography variant='body1'>
            - Interrupções causadas por terceiros, como operadoras, provedores ou serviços integrados;
          </Typography>
          <Typography variant='body1'>- Conteúdo inserido por usuários na plataforma.</Typography>
        </SectionBox>

        <SectionBox>
          <Typography variant='h5' component='h2'>
            10. Alterações nos Termos
          </Typography>
          <Typography variant='body1'>
            Este Termo pode ser alterado a qualquer momento, mediante aviso prévio ao usuário por e-mail ou pela própria
            plataforma. O uso contínuo dos serviços após as alterações implica aceitação automática dos novos termos.
          </Typography>
        </SectionBox>

        <SectionBox>
          <Typography variant='h5' component='h2'>
            11. Foro e Legislação Aplicável
          </Typography>
          <Typography variant='body1'>
            Este Termo é regido pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca de
            Brasilia-DF, com renúncia a qualquer outro, por mais privilegiado que seja, para dirimir quaisquer conflitos
            oriundos deste Termo.
          </Typography>
        </SectionBox>

        <SectionBox>
          <Typography variant='h5' component='h2'>
            12. Cancelamento e Rescisão
          </Typography>
          <Typography variant='body1'>
            O usuário poderá, a qualquer momento, solicitar o cancelamento de sua conta ou dos serviços contratados,
            mediante envio de solicitação via e-mail ou área do cliente. Em caso de cancelamento, os dados serão
            mantidos conforme a política de retenção da AIYOU ou excluídos mediante solicitação do titular.
          </Typography>
        </SectionBox>

        <SectionBox>
          <Typography variant='h5' component='h2'>
            13. Política de Pagamentos e Reembolsos
          </Typography>
          <Typography variant='body1'>
            A contratação dos serviços poderá implicar em cobranças periódicas. O usuário será informado previamente
            sobre valores, periodicidade, formas de pagamento e possibilidade de reembolso. A inadimplência poderá
            implicar na suspensão dos serviços até a regularização.
          </Typography>
        </SectionBox>

        <SectionBox>
          <Typography variant='h5' component='h2'>
            14. Integrações com Terceiros
          </Typography>
          <Typography variant='body1'>
            A AIYOU poderá integrar sua plataforma a sistemas de terceiros, não se responsabilizando por falhas ou danos
            causados por esses sistemas, salvo nos casos em que houver responsabilidade solidária expressamente
            contratada.
          </Typography>
        </SectionBox>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant='body2' color='text.secondary'>
            Este documento constitui o Termo de Serviço da AIYOU e está sujeito às leis brasileiras.
          </Typography>
        </Box>
      </StyledPaper>
    </Container>
  )
}

export default TermosDeServicoAIYOU
