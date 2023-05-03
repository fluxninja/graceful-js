import React, { FC } from 'react'
import { errorComponentMap, useMostRecentError } from './decider'
import { GracefulErrorStatus } from '../types'

export const GracefulError: FC = () => {
  const {
    ctx: { status },
  } = useMostRecentError()

  if (!status) {
    return null
  }

  return errorComponentMap.get(status as GracefulErrorStatus) || null
}
