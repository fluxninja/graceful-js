import React, { FC } from 'react'
import { DefaultError } from './default-error'
import { createErrorInfoKey, useGraceful } from '../hooks'
import { SelectErrorComponentWithStatusCode } from './decider'
import { CreateErrorIdPayload } from '../hooks'

export interface GracefulErrorProps extends CreateErrorIdPayload {}

export const GracefulError: FC<GracefulErrorProps> = (props) => {
  const { errorInfo, DefaultErrorComponent } = useGraceful()

  return (
    errorInfo.get(createErrorInfoKey(props))?.errorComponent ||
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
