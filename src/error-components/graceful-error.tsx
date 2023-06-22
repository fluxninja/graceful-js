import React, { FC } from 'react'
import { useMostRecentError } from './decider'
import { DefaultError } from './default-error'

export interface GracefulErrorProps {
  errorComponentID: string
}

export const GracefulError: FC<GracefulErrorProps> = ({ errorComponentID }) => {
  const errToRender = useMostRecentError(errorComponentID)

  return errToRender.get(errorComponentID)?.component || <DefaultError />
}
