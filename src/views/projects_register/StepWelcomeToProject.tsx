// React Imports

// MUI Imports

import Typography from '@mui/material/Typography'

import { Box, Container } from '@mui/material'

type Props = {
  activeStep: number
  handleNext: () => void
  handlePrev: () => void
  steps: { title: string; subtitle: string }[]
}

// Mock data - você substituirá por dados reais do seu store/context

const StepWelcomeToProject = ({ handleNext, handlePrev }: Props) => {
  // Componente de estatísticas
  return (
    <Container>
      <Box className='flex flex-col align-center mb-10'>
        <Typography variant='h2'>Bem-Vindo!</Typography>
        <Typography variant='subtitle1'>Seja muito bem-vindo à criação do seu primeiro projeto!</Typography>
      </Box>
      <Box className='flex flex-col align-center '>
        <Typography variant='h5' color='primary' className='mb-2'>
          Como funciona os Projetos?
        </Typography>
        <Typography variant='subtitle1'>
          Os Projetos são como pastas de organização onde você pode atribuir assistentes Aiyou para cumprir objetivos
          específicos.
        </Typography>
        <Typography variant='subtitle1'>
          Se o seu plano permite até 10 assistentes, você pode criar quantos projetos quiser e atribuir um ou mais
          assistentes a cada um deles.
        </Typography>
        <Typography variant='subtitle1'>Por exemplo:</Typography>
        <ul>
          <li>
            Se você quer que um assistente cuide do seu SAC, basta criar um projeto chamado SAC e atribuir um ou mais
            assistentes a ele.
          </li>
          <li>Se nesse caso você atribuir apenas 1 assistente, ainda terá 9 disponíveis para outros projetos.</li>
          <li>
            Você pode distribuir esses assistentes da forma que preferir: todos em um único projeto ou divididos entre
            vários.
          </li>
          <Typography variant='h6' className='my-4'>
            ⚠️ Importante:
          </Typography>
          <li>Um projeto sem assistente não funcionará.</li>
          <li>Ao migrar um assistente para outro projeto, ele deixará de atuar no projeto anterior.</li>
          <li>Sempre verifique as especificações do assistente antes de movê-lo.</li>
        </ul>

        <Typography>
          Se tiver dúvidas ou quiser mais informações, fale com um dos assistentes ou entre em contato com nossa equipe
          de atendimento. Para conhecer mais sobre um assistente específico, clique aqui.
        </Typography>
      </Box>
    </Container>
  )
}

export default StepWelcomeToProject
