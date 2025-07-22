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

const PoliticaPrivacidadeAIYOU = () => {
  const theme = useTheme()

  // const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const handleDownloadPDF = () => {
    // Aqui você pode implementar o download real do PDF
    // Por enquanto, vou simular o download
    const link = document.createElement('a')

    link.href = 'public/PDF/Politica_de_Privacidade_AIYOU.pdf' // Substitua pelo caminho real do PDF
    link.download = 'Politica-de-Privacidade-AIYOU.pdf'
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
          POLÍTICA DE PRIVACIDADE – AIYOU
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
            Comprometida com a proteção da sua privacidade
          </Typography>
        </CompanyInfo>

        <SectionBox>
          <Typography variant='h5' component='h2'>
            1. Introdução
          </Typography>
          <Typography variant='body1'>
            A privacidade dos visitantes do nosso site é muito importante para nós, e estamos comprometidos em
            protegê-la.
          </Typography>
          <Typography variant='body1'>Esta política explica o que faremos com suas informações pessoais.</Typography>
          <Typography variant='body1'>
            Ao consentir com o uso de cookies, conforme os termos desta política, quando você acessa nosso site pela
            primeira vez, você nos permite utilizar cookies sempre que visitar nossa página. Esses cookies são
            ferramentas técnicas que possibilitam uma melhor experiência de navegação.
          </Typography>
        </SectionBox>

        <SectionBox>
          <Typography variant='h5' component='h2'>
            2. Coleta de Dados Pessoais
          </Typography>
          <Typography variant='body1'>Coletamos as seguintes informações:</Typography>
          <Typography variant='body1'>
            2.1 Informações sobre seu computador, incluindo endereço IP, localização geográfica, tipo e versão do
            navegador e sistema operacional;
          </Typography>
          <Typography variant='body1'>
            2.2 Informações sobre suas visitas e uso do site, como fonte de referência, duração da visita, visualizações
            e navegação;
          </Typography>
          <Typography variant='body1'>2.3 Dados fornecidos por você no cadastro, como endereço de e-mail;</Typography>
          <Typography variant='body1'>
            2.4 Informações inseridas ao criar um perfil, como nome, foto de perfil, gênero, data de nascimento, status
            de relacionamento, interesses, formação e histórico profissional;
          </Typography>
          <Typography variant='body1'>
            2.5 Nome e e-mail cadastrados para receber newsletters ou outras comunicações;
          </Typography>
          <Typography variant='body1'>
            2.6 Informações fornecidas durante a utilização dos serviços oferecidos pelo site;
          </Typography>
          <Typography variant='body1'>
            2.7 Dados gerados durante o uso do site (frequência, horários e padrões de navegação);
          </Typography>
          <Typography variant='body1'>
            2.8 Informações de compras ou transações realizadas pelo site (nome, endereço, telefone, e-mail e dados do
            cartão de crédito);
          </Typography>
          <Typography variant='body1'>
            2.9 Conteúdo postado com intenção de ser publicado no site (nome de usuário, foto, textos, etc.);
          </Typography>
          <Typography variant='body1'>
            2.10 Informações oriundas de comunicações enviadas por e-mail ou via formulários do site;
          </Typography>
          <Typography variant='body1'>
            2.11 Qualquer outra informação pessoal que você voluntariamente enviar.
          </Typography>
          <Typography variant='body1'>
            <strong>Importante:</strong> Caso você compartilhe dados pessoais de terceiros, é sua responsabilidade obter
            o consentimento expresso dessas pessoas para essa finalidade.
          </Typography>
        </SectionBox>

        <SectionBox>
          <Typography variant='h5' component='h2'>
            3. Uso de Informações Pessoais
          </Typography>
          <Typography variant='body1'>
            As informações fornecidas serão utilizadas exclusivamente para os propósitos definidos nesta política ou em
            áreas específicas do site.
          </Typography>
          <Typography variant='body1'>Podemos usar seus dados para:</Typography>
          <Typography variant='body1'>3.1 Administrar o site e os negócios da AIYOU;</Typography>
          <Typography variant='body1'>3.2 Personalizar o site conforme suas preferências;</Typography>
          <Typography variant='body1'>3.3 Disponibilizar os serviços oferecidos;</Typography>
          <Typography variant='body1'>3.4 Enviar produtos adquiridos;</Typography>
          <Typography variant='body1'>3.5 Prestar os serviços contratados;</Typography>
          <Typography variant='body1'>3.6 Enviar faturas, notificações e cobranças;</Typography>
          <Typography variant='body1'>3.7 Enviar comunicações administrativas (não comerciais);</Typography>
          <Typography variant='body1'>3.8 Enviar e-mails solicitados por você;</Typography>
          <Typography variant='body1'>3.9 Enviar comunicações promocionais, com seu consentimento prévio;</Typography>
          <Typography variant='body1'>3.10 Compartilhar dados estatísticos anonimizados com terceiros;</Typography>
          <Typography variant='body1'>3.11 Lidar com dúvidas, reclamações e suporte;</Typography>
          <Typography variant='body1'>3.12 Garantir a segurança do site e evitar fraudes;</Typography>
          <Typography variant='body1'>3.13 Monitorar o cumprimento dos termos de uso;</Typography>
          <Typography variant='body1'>
            3.14 Outras finalidades, desde que comunicadas previamente e com seu consentimento.
          </Typography>
        </SectionBox>

        <SectionBox>
          <Typography variant='h5' component='h2'>
            4. Compartilhamento de Dados Pessoais
          </Typography>
          <Typography variant='body1'>Podemos compartilhar suas informações pessoais com:</Typography>
          <Typography variant='body1'>
            - Colaboradores, consultores, fornecedores, seguradoras e parceiros, quando necessário;
          </Typography>
          <Typography variant='body1'>- Empresas do mesmo grupo econômico da AIYOU;</Typography>
          <Typography variant='body1'>- Autoridades judiciais ou administrativas, mediante ordem legal;</Typography>
          <Typography variant='body1'>
            - Terceiros, em caso de operações societárias (fusão, aquisição ou venda de ativos), com comunicação prévia.
          </Typography>
          <Typography variant='body1'>
            Jamais venderemos seus dados a terceiros. Qualquer outro compartilhamento será feito mediante seu
            consentimento.
          </Typography>
        </SectionBox>

        <SectionBox>
          <Typography variant='h5' component='h2'>
            5. Transferência Internacional de Dados
          </Typography>
          <Typography variant='body1'>
            Alguns dados poderão ser processados ou armazenados fora do Brasil, em países que podem não ter leis
            equivalentes às da LGPD. Nesses casos, adotamos medidas contratuais e técnicas para garantir a proteção dos
            dados conforme o artigo 33 da Lei nº 13.709/2018.
          </Typography>
          <Typography variant='body1'>
            Ao utilizar nossos serviços, você reconhece e concorda com essa possibilidade.
          </Typography>
        </SectionBox>

        <SectionBox>
          <Typography variant='h5' component='h2'>
            6. Retenção de Dados Pessoais
          </Typography>
          <Typography variant='body1'>
            Os dados pessoais são retidos apenas pelo tempo necessário para atingir os fins pelos quais foram coletados
            ou conforme obrigações legais.
          </Typography>
          <Typography variant='body1'>Manteremos documentos que contenham dados pessoais:</Typography>
          <Typography variant='body1'>6.1 Quando exigido por lei;</Typography>
          <Typography variant='body1'>6.2 Se forem relevantes em processos judiciais;</Typography>
          <Typography variant='body1'>
            6.3 Para exercer ou defender nossos direitos legais e interesses legítimos.
          </Typography>
        </SectionBox>

        <SectionBox>
          <Typography variant='h5' component='h2'>
            7. Segurança dos Dados
          </Typography>
          <Typography variant='body1'>
            Adotamos medidas técnicas e organizacionais para proteger seus dados contra perda, uso indevido ou acesso
            não autorizado.
          </Typography>
          <Typography variant='body1'>
            - Os dados são armazenados em servidores seguros com senha e firewall;
          </Typography>
          <Typography variant='body1'>- Transações financeiras são criptografadas;</Typography>
          <Typography variant='body1'>- Incidentes de segurança serão prontamente comunicados ao titular;</Typography>
          <Typography variant='body1'>- Investimos continuamente em cibersegurança.</Typography>
        </SectionBox>

        <SectionBox>
          <Typography variant='h5' component='h2'>
            8. Alterações nesta Política
          </Typography>
          <Typography variant='body1'>
            Esta política poderá ser atualizada. Quando houver alterações relevantes, notificaremos os usuários por
            e-mail ou por mensagem no próprio site.
          </Typography>
          <Typography variant='body1'>Recomendamos que você revise esta política periodicamente.</Typography>
        </SectionBox>

        <SectionBox>
          <Typography variant='h5' component='h2'>
            9. Seus Direitos
          </Typography>
          <Typography variant='body1'>De acordo com a LGPD, você pode:</Typography>
          <Typography variant='body1'>- Acessar, corrigir ou excluir seus dados;</Typography>
          <Typography variant='body1'>- Solicitar a portabilidade;</Typography>
          <Typography variant='body1'>- Revogar consentimentos;</Typography>
          <Typography variant='body1'>- Restringir ou se opor ao tratamento de seus dados;</Typography>
          <Typography variant='body1'>- Solicitar informações sobre uso e compartilhamento dos dados.</Typography>
          <Typography variant='body1'>
            Esses direitos podem ser exercidos a qualquer momento, e nos comprometemos a respondê-los com agilidade e
            transparência.
          </Typography>
        </SectionBox>

        <SectionBox>
          <Typography variant='h5' component='h2'>
            10. Sites de Terceiros
          </Typography>
          <Typography variant='body1'>
            Nosso site pode conter links para sites de terceiros. Não nos responsabilizamos pelas práticas de
            privacidade ou conteúdo desses sites.
          </Typography>
        </SectionBox>

        <SectionBox>
          <Typography variant='h5' component='h2'>
            11. Atualização de Informações e Contato
          </Typography>
          <Typography variant='body1'>
            Caso precise atualizar seus dados ou tenha dúvidas sobre esta política, entre em contato com a AIYOU por
            meio dos canais abaixo:
          </Typography>
          <Typography variant='body1'>11.1 Fale Conosco – LGPD: Exerça seus direitos;</Typography>
          <Typography variant='body1'>11.2 Encarregado de Dados (DPO): lgpd@playmovel.com.br;</Typography>
          <Typography variant='body1'>
            11.3 Todos os fornecedores que tratam dados em nome da AIYOU devem seguir as diretrizes desta Política e as
            normas internas de segurança da informação.
          </Typography>
        </SectionBox>

        <SectionBox>
          <Typography variant='h5' component='h2'>
            12. Cookies
          </Typography>
          <Typography variant='body1'>Nosso site utiliza cookies para:</Typography>
          <Typography variant='body1'>- Lembrar preferências do usuário;</Typography>
          <Typography variant='body1'>- Melhorar a experiência de navegação;</Typography>
          <Typography variant='body1'>- Analisar métricas de acesso.</Typography>
          <Typography variant='body1'>
            Você pode desativar cookies nas configurações do seu navegador, mas isso pode impactar a funcionalidade do
            site.
          </Typography>
        </SectionBox>

        <SectionBox>
          <Typography variant='h5' component='h2'>
            13. Base Legal para Tratamento
          </Typography>
          <Typography variant='body1'>
            Cada dado pessoal coletado será tratado com base em uma das hipóteses legais previstas na LGPD (Lei
            13.709/2018), incluindo consentimento, cumprimento de obrigação legal, execução de contrato, exercício
            regular de direitos, ou legítimo interesse, quando aplicável.
          </Typography>
        </SectionBox>

        <SectionBox>
          <Typography variant='h5' component='h2'>
            14. Registro de Atividades
          </Typography>
          <Typography variant='body1'>
            A AIYOU mantém registros das operações de tratamento de dados pessoais, conforme exigido pela LGPD, e adota
            medidas técnicas e administrativas adequadas para garantir sua segurança e conformidade.
          </Typography>
        </SectionBox>

        <SectionBox>
          <Typography variant='h5' component='h2'>
            15. Exercício de Direitos
          </Typography>
          <Typography variant='body1'>
            O titular de dados pode exercer seus direitos por meio do canal oficial indicado nesta política. O prazo de
            resposta será de até 15 dias corridos, conforme art. 19 da LGPD.
          </Typography>
        </SectionBox>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant='body2' color='text.secondary'>
            Esta Política de Privacidade está em conformidade com a Lei Geral de Proteção de Dados (LGPD)
          </Typography>
        </Box>
      </StyledPaper>
    </Container>
  )
}

export default PoliticaPrivacidadeAIYOU
