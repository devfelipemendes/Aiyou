import { useState, useEffect } from 'react'

interface UseStaggeredAnimationOptions {
  itemCount: number
  delay?: number
  stagger?: number
  show?: boolean
}

export const useStaggeredAnimation = ({
  itemCount,
  delay = 100,
  stagger = 100,
  show = true
}: UseStaggeredAnimationOptions) => {
  const [visibleItems, setVisibleItems] = useState<boolean[]>(new Array(itemCount).fill(false))

  useEffect(() => {
    if (show) {
      // Reset todos os items
      setVisibleItems(new Array(itemCount).fill(false))

      // Mostrar cada item com delay escalonado
      for (let i = 0; i < itemCount; i++) {
        setTimeout(
          () => {
            setVisibleItems(prev => {
              const newState = [...prev]

              newState[i] = true

              return newState
            })
          },
          delay + i * stagger
        )
      }
    } else {
      setVisibleItems(new Array(itemCount).fill(false))
    }
  }, [itemCount, delay, stagger, show])

  return visibleItems
}
