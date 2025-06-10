'use client'

import Image from 'next/image'

import { motion } from 'framer-motion'
import { Typewriter } from 'react-simple-typewriter'

export default function LoadingScreen() {
  return (
    <div className='fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white px-4'>
      <motion.div
        initial={{ scale: 0.9, rotate: 0, opacity: 0 }}
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 10, -10, 0],
          opacity: 1
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className='w-24 h-24 mb-6'
      >
        <Image
          src='/assets/aiyou-icon.svg'
          alt='AIyou Logo'
          width={96}
          height={96}
          className='drop-shadow-xl'
          priority
        />
      </motion.div>

      <div className='text-xl sm:text-2xl text-center font-medium h-12'>
        <Typewriter
          words={[
            'Conectando você a um atendimento inteligente...',
            'Seu assistente pessoal, sempre disponível.',
            'AIyou está preparando respostas incríveis pra você.',
            'Tecnologia e empatia no mesmo clique.',
            'Transformando conversas em soluções.'
          ]}
          loop={0} // 0 = infinito
          cursor
          cursorStyle='|'
          typeSpeed={50}
          deleteSpeed={40}
          delaySpeed={0}
        />
      </div>
    </div>
  )
}
