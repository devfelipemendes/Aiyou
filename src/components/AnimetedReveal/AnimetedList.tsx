import React from 'react'

import type { AnimationType } from '@/components/AnimetedReveal'
import { AnimatedReveal } from '@/components/AnimetedReveal'
import { useStaggeredAnimation } from '@/hooks/useStaggeredAnimation'

interface AnimatedListProps {
  children: React.ReactNode[]
  animation?: AnimationType
  duration?: number
  delay?: number
  stagger?: number
  show?: boolean
  className?: string
  sx?: any
  onAnimationComplete?: () => void
}

const AnimatedList: React.FC<AnimatedListProps> = ({
  children,
  animation = 'slideInUp',
  duration = 600,
  delay = 100,
  stagger = 150,
  show = true,
  className,
  sx,
  onAnimationComplete
}) => {
  const visibleItems = useStaggeredAnimation({
    itemCount: children.length,
    delay,
    stagger,
    show
  })

  // Callback quando todas as animações terminam
  React.useEffect(() => {
    if (onAnimationComplete && visibleItems.every(item => item === true) && visibleItems.length > 0) {
      const totalDelay = delay + (children.length - 1) * stagger + duration

      setTimeout(onAnimationComplete, totalDelay)
    }
  }, [visibleItems, onAnimationComplete, delay, stagger, duration, children.length])

  return (
    <>
      {children.map((child, index) => (
        <AnimatedReveal
          key={index}
          animation={animation}
          duration={duration}
          show={visibleItems[index]}
          className={className}
          sx={sx}
        >
          {child}
        </AnimatedReveal>
      ))}
    </>
  )
}

export default AnimatedList
