import React, { FC } from 'react'
import { errorComponentMap, useMostRecentError } from './decider'

export const GracefulError: FC = () => {
  const {
    ctx: { status },
  } = useMostRecentError()

  if (!status) {
    return null
  }

  return errorComponentMap.get(status) || null
}
