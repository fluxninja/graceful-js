import React, { FC } from 'react'
import { DefaultError } from './default-error'
import { ErrorInfoKey } from '../provider'
import { useGraceful } from '../hooks'

export interface GracefulErrorProps extends ErrorInfoKey {}

export const GracefulError: FC<GracefulErrorProps> = ({ url, requestBody }) => {
  const { errorInfo, DefaultErrorComponent } = useGraceful()

  return (
    errorInfo.get(
      JSON.stringify({
        url,
        requestBody,
      })
    )?.errorComponent ||
    DefaultErrorComponent || <DefaultError />
  )
}
