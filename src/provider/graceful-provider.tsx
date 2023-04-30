import { useInterceptors } from '../hooks'
import React, {
  Dispatch,
  FC,
  PropsWithChildren,
  SetStateAction,
  useState,
} from 'react'
import {
  GracefulContext,
  GracefulContextProps,
  initialProps,
} from './graceful-context'
import { AxiosInstance } from 'axios'

export declare type UseInterceptorsHook = (
  setGracefulContext: Dispatch<SetStateAction<GracefulContextProps>>
) => void

export declare type Config = {
  axios?: AxiosInstance
  urlList?: string[]
}

export interface GracefulProviderProps {
  config?: Config
}

export const GracefulProvider: FC<PropsWithChildren<GracefulProviderProps>> = ({
  children,
  config,
}) => {
  const [context, setContext] = useState<GracefulContextProps>(initialProps)

  useInterceptors(setContext, config)

  return (
    <GracefulContext.Provider value={context}>
      {children}
    </GracefulContext.Provider>
  )
}
