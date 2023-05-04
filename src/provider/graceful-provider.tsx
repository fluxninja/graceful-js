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
  errorComponentMap?: Map<number, JSX.Element>
  DefaultErrorComponent?: JSX.Element
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
      ...(config?.errorComponentMap && {
        errorComponentMap: config.errorComponentMap,
      }),
      ...(config?.DefaultErrorComponent && {
        DefaultErrorComponent: config.DefaultErrorComponent,
      }),
      setGraceful,
    }),
    [context]
  )

  return (
    <GracefulStore.Provider value={value}>{children}</GracefulStore.Provider>
  )
}
