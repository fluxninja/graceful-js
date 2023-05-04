/**
 * This module is responsible for deciding which error component to render
 */

import { useEffect, useState } from 'react'
import { GracefulProps, initialProps } from '../provider'
import { useGraceful } from '../hooks'
import { RateLimit } from './rate-limit'

export const useMostRecentError = () => {
  const [currentError, setCurrent] = useState<GracefulProps>(initialProps)

  const props = useGraceful()

  useEffect(() => {
    setCurrent(props)
  }, [])

  useEffect(() => {
    const {
      ctx: { status, url },
    } = props
    if (!url.length) {
      return
    }
    if (url === currentError.ctx.url && status !== currentError.ctx.status) {
      // if status is change on same endpoint, update currentError
      setCurrent(props)
    }
  }, [currentError, props])

  return currentError
}

export const errorComponentMap: Map<number, JSX.Element> = new Map([
  [429, <RateLimit />],
  [503, <RateLimit />],
  [504, <RateLimit />],
])
