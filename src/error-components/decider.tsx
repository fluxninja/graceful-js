/**
 * This module is responsible for deciding which error component to render
 */

import { FC, useEffect, useState } from 'react'
import { GracefulProps, initialProps } from '../provider'
import { useGraceful } from '../hooks'
import { GracefulErrorStatus } from '../types'
import { RateLimit } from './rate-limit'

export const useMostRecentError = () => {
  const [currentError, setCurrent] = useState<GracefulProps>(initialProps)

  const props = useGraceful()

  useEffect(() => {
    setCurrent(props)
  }, [])

  return currentError
}

export const errorComponentMap: Map<GracefulErrorStatus, JSX.Element> = new Map(
  [[429, <RateLimit />]]
)
