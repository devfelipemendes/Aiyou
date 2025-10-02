'use client'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import classnames from 'classnames'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

const FooterContent = () => {
  // Hooks
  const { isBreakpointReached } = useVerticalNav()

  return (
    <div
      className={classnames(verticalLayoutClasses.footerContent, 'flex items-center justify-between flex-wrap gap-4')}
    >
      <p>
        <span>{`© ${new Date().getFullYear()}, Feito com `}</span>
        <span>{`❤️`}</span>
        <span>{` por `}</span>
        <Link href='' target='_blank' className='text-primary'>
          Play Tecnologia
        </Link>
      </p>
      {!isBreakpointReached && (
        <div className='flex items-center gap-4'>
          <Link href='' target='_blank' className='text-primary'>
            Licença
          </Link>
          <Link href='' target='_blank' className='text-primary'>
            Mais informações
          </Link>
          <Link href='' target='_blank' className='text-primary'>
            Documentação
          </Link>
          <Link href='https://themeselection.com/support' target='_blank' className='text-primary'>
            Suporte
          </Link>
        </div>
      )}
    </div>
  )
}

export default FooterContent
