import { Box, Typography } from '@mui/material'
import { Settings } from 'lucide-react'
import { Typewriter } from 'react-simple-typewriter'

const AvailableSoon = () => {
  const fullText = 'Em Desenvolvimento...' // texto completo

  return (
    <Box
      className='absolute inset-0 flex items-center justify-center gap-10 z-10 rounded-sm border border-warning'
      style={{
        backgroundColor: 'rgba(75, 85, 99, 0.9)', // equivalente ao bg-gray-600/80
        opacity: 0.9, // aplica opacidade em tudo dentro do Box
        boxShadow: '0px 1px 3px rgba(0,0,0,0.2), 0px 1px 1px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.12)'
      }}
    >
      <Settings
        size={40}
        className='text-warning'
        style={{
          animation: 'spin 3s linear infinite' // rotação suave
        }}
      />
      <Typography className='text-warning text-[25px]' style={{ minWidth: `${fullText.length}ch` }}>
        <Typewriter
          words={[fullText]}
          loop={0}
          cursor
          cursorStyle='|'
          typeSpeed={80}
          deleteSpeed={50}
          delaySpeed={1000}
        />
      </Typography>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </Box>
  )
}

export default AvailableSoon
