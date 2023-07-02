import React, { FC } from 'react'
import { DefaultError } from './default-error'
import { ErrorInfoKey } from '../provider'
import { useGraceful } from '../hooks'
import { SelectErrorComponentWithStatusCode } from './decider'

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

export interface GracefulErrorByStatusProps {
  status: number
}
export const GracefulErrorByStatus: FC<GracefulErrorByStatusProps> = ({
  status,
}) => {
  const { errorComponentMap: userComponentMap, DefaultErrorComponent } =
    useGraceful()

  return (
    <SelectErrorComponentWithStatusCode
      {...{
        status,
        userComponentMap,
        DefaultErrorComponent,
      }}
    />
  )
}
