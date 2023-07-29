import { useInterceptors } from '../hooks'
import React, {
  FC,
  PropsWithChildren,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  GracefulProps,
  GracefulStore,
  GracefulTheme,
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
 * @property {JSX.Element} WaitingRoomErrorComponent - The error component to render for the waiting room.
 * @property {number} maxBackOffTime - maximum exponential back-off time in seconds. Default is 20 seconds.
 * @property {number} maxRequestResolveTime - maximum time in seconds to wait for a request to resolve. Default is 10 seconds.
 */
export declare type Config = {
  axios?: AxiosInstance
  urlList?: string[]
  theme?: GracefulTheme
  errorComponentMap?: Map<number, JSX.Element>
  DefaultErrorComponent?: JSX.Element
  WaitingRoomErrorComponent?: JSX.Element
  maxBackOffTime?: number
  maxRequestResolveTime?: number
}

export interface GracefulProviderProps {
  config?: Config
}

export let maxBackOffTime = 20
export let maxRequestResolveTime = 10

export const GracefulProvider: FC<PropsWithChildren<GracefulProviderProps>> = ({
  children,
  config,
}) => {
  const [props, setGraceful] = useState<GracefulProps>(initialProps)

  useInterceptors(setGraceful, config)

  useEffect(() => {
    maxBackOffTime = config?.maxBackOffTime || 20
  }, [config?.maxBackOffTime])

  useEffect(() => {
    maxRequestResolveTime = config?.maxRequestResolveTime || 10
  }, [config?.maxRequestResolveTime])

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
      ...(config?.WaitingRoomErrorComponent && {
        WaitingRoomErrorComponent: config.WaitingRoomErrorComponent,
      }),
      axios: config?.axios,
      setGraceful,
    }),
    [config, props]
  )

  return (
    <GracefulStore.Provider value={value}>{children}</GracefulStore.Provider>
  )
}
