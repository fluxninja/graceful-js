import React, { FC } from 'react'
import { RateLimit } from './rate-limit'
import { DefaultError } from './default-error'
import { GracefulContextProps } from '../provider'

export const errorComponentMap = (
  errorProps?: GracefulContextProps
): Map<number, JSX.Element> =>
  new Map([
    [429, <RateLimit key={0} {...errorProps} />],
    [503, <RateLimit key={1} {...errorProps} />],
    [504, <RateLimit key={2} {...errorProps} />],
  ])

export interface SelectErrorComponentProps {
  errorProps?: GracefulContextProps
  status: number
  userComponentMap?: Map<number, JSX.Element>
  DefaultErrorComponent?: JSX.Element
}

export const SelectErrorComponentWithStatusCode: FC<
  SelectErrorComponentProps
> = ({ status, userComponentMap, DefaultErrorComponent, errorProps }) => {
  return (
    (userComponentMap && userComponentMap.get(status)) ||
    errorComponentMap(errorProps).get(status) ||
    DefaultErrorComponent || <DefaultError />
  )
}
