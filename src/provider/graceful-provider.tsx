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

/**
 * Configuration object for the GracefulProvider component.
 * @property {AxiosInstance} axios - An Axios instance to use for making HTTP requests.
 * @property {string[]} urlList - A list of URLs to intercept and handle gracefully.
 * @property {GracefulTheme} theme - The theme object to use for styling the error components.
 * @property {Map<number, JSX.Element>} errorComponentMap - A map of HTTP status codes to custom error components to render for each code.
 * @property {JSX.Element} DefaultErrorComponent - The default error component to render if no custom component is provided for a given status code.
 */
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
