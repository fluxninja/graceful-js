import { useInterceptors } from '../hooks'
import React, { FC, PropsWithChildren, useMemo, useState } from 'react'
import {
  GracefulProps,
  GracefulStore,
  GracefulTheme,
  initialProps,
} from './graceful-context'
import { AxiosInstance } from 'axios'
import { ErrorComponentProvider } from '../error-components'

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
  const [props, setGraceful] = useState<GracefulProps>(initialProps)

  useInterceptors(setGraceful, config)

  const value: GracefulProps = useMemo(
    () => ({
      ...props,
      ...(config?.theme && { theme: config.theme }),
      ...(config?.errorComponentMap && {
        errorComponentMap: config.errorComponentMap,
      }),
      ...(config?.DefaultErrorComponent && {
        DefaultErrorComponent: config.DefaultErrorComponent,
      }),
      axios: config?.axios,
      setGraceful,
    }),
    [config, props]
  )

  return (
    <GracefulStore.Provider value={value}>
      <ErrorComponentProvider>{children}</ErrorComponentProvider>
    </GracefulStore.Provider>
  )
}
