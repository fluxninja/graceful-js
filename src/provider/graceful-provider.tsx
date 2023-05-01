import { useInterceptors } from '../hooks'
import React, {
  Dispatch,
  FC,
  PropsWithChildren,
  SetStateAction,
  useMemo,
  useState,
} from 'react'
import {
  GracefulContext,
  GracefulContextProps,
  GracefulProps,
  GracefulStore,
  GracefulTheme,
  initialContextProps,
  initialProps,
} from './graceful-context'
import { AxiosInstance } from 'axios'
import { ApplyGlobalRateLimitError } from '../error-components/rate-limit/components/global-rate-limit'

export declare type UseInterceptorsHook = (
  setGracefulContext: Dispatch<SetStateAction<GracefulContextProps>>
) => void

export declare type Config = {
  axios?: AxiosInstance
  urlList?: string[]
  theme?: GracefulTheme
}

export interface GracefulProviderProps {
  config?: Config
}

export const GracefulProvider: FC<PropsWithChildren<GracefulProviderProps>> = ({
  children,
  config,
}) => {
  const [context, setContext] = useState<GracefulContext>(initialContextProps)
  const [, setGraceful] = useState<GracefulProps>(initialProps)

  useInterceptors(setContext, config)

  const value: GracefulProps = useMemo(
    () => ({
      ...context,
      ...(config?.theme && { theme: config.theme }),
      setGraceful,
    }),
    [context]
  )

  return (
    <GracefulStore.Provider value={value}>
      <ApplyGlobalRateLimitError>{children}</ApplyGlobalRateLimitError>
    </GracefulStore.Provider>
  )
}
