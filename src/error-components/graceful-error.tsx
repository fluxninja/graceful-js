import React, { FC } from 'react'
import { errorComponentMap, useMostRecentError } from './decider'
import { DefaultError } from './default-error'
import { useGraceful } from '../hooks'

export const GracefulError: FC = () => {
  const {
    ctx: { status, isError },
  } = useMostRecentError()

  const {
    errorComponentMap: userProvidedComponents,
    DefaultErrorComponent: UserDefault,
  } = useGraceful()

  if (!status) {
    return null
  }

  if (!isError) {
    return null
  }

  return (
    (userProvidedComponents?.get(status) ?? UserDefault) ||
    (errorComponentMap.get(status) ?? <DefaultError />)
  )
}
