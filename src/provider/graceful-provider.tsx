import { useInterceptors } from '../hooks'
import React, {
  Dispatch,
  FC,
  PropsWithChildren,
  SetStateAction,
  useState,
} from 'react'
import { GracefulContext, GracefulContextProps } from './graceful-context'
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
  config,
  children,
}) => {
  const [context, setContext] = useState<GracefulContextProps>(
    {} as GracefulContextProps
  )

  useInterceptors(setContext, config)

  return (
    <GracefulContext.Provider value={context}>
      {children}
    </GracefulContext.Provider>
  )
}
