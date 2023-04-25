import { useInterceptors } from '../hooks'
import React, {
  Dispatch,
  FC,
  PropsWithChildren,
  SetStateAction,
  useState,
} from 'react'
import { GracefulContext, GracefulContextProps } from './graceful-context'
import { RateLimit } from '../error-components'

export declare type UseInterceptorsHook = (
  setContext: Dispatch<SetStateAction<GracefulContextProps>>
) => void

export interface GracefulProviderProps {
  urlList?: string[]
  applyCustomInterceptors?: boolean
  useInterceptorHook?: UseInterceptorsHook
}

export const GracefulProvider: FC<PropsWithChildren<GracefulProviderProps>> = ({
  urlList,
  children,
  applyCustomInterceptors = false,
  useInterceptorHook = () => {},
}) => {
  const [context, setContext] = useState<GracefulContextProps>(
    {} as GracefulContextProps
  )

  useInterceptors(setContext, urlList, applyCustomInterceptors)
  useInterceptorHook(setContext)
  console.log('context--', context)

  return (
    <GracefulContext.Provider value={context}>
      {children}
    </GracefulContext.Provider>
  )
}
