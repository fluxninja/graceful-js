import { FC } from 'react'
import { RateLimit } from './rate-limit'
import { DefaultError } from './default-error'

export const errorComponentMap = (errorKey: string): Map<number, JSX.Element> =>
  new Map([
    [429, <RateLimit errorComponentKey={errorKey} />],
    [503, <RateLimit errorComponentKey={errorKey} />],
    [504, <RateLimit errorComponentKey={errorKey} />],
  ])

export interface SelectErrorComponentProps {
  errorComponentKey: string
  status: number
  userComponentMap?: Map<number, JSX.Element>
  DefaultErrorComponent?: JSX.Element
}

export const SelectErrorComponentWithStatusCode: FC<
  SelectErrorComponentProps
> = ({
  status,
  userComponentMap,
  DefaultErrorComponent,
  errorComponentKey,
}) => {
  return (
    (userComponentMap && userComponentMap.get(status)) ||
    errorComponentMap(errorComponentKey).get(status) ||
    DefaultErrorComponent || <DefaultError />
  )
}
