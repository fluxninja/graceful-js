import { useInterceptors } from '../hooks'
import React, { FC, PropsWithChildren, useMemo, useState } from 'react'
import {
  GracefulContext,
  GracefulProps,
  GracefulStore,
  GracefulTheme,
  initialContextProps,
  initialProps,
} from './graceful-context'
import { AxiosInstance } from 'axios'

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
    <GracefulStore.Provider value={value}>{children}</GracefulStore.Provider>
  )
}
