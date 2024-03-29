import { AxiosInstance } from 'axios'
import { noop } from 'lodash'
import { Dispatch, SetStateAction, createContext } from 'react'
import { AnyObject } from '../types'

export declare type GracefulContextProps = {
  headers: Record<string, string>
  url: string
  isError: boolean
  status: number
  responseBody: AnyObject | null
  typeOfRequest: 'FETCH' | 'AXIOS'
  method: string
  requestBody: AnyObject | null
  retriesLeft?: number
}

export declare type GracefulTheme = {
  primary: string
  secondary: string
  text: string
}

export declare type GracefulContext = {
  ctx: GracefulContextProps
}

export type ErrorInfoValue = GracefulContextProps & {
  errorComponent: JSX.Element
}

export declare type ErrorInfo = Map<string, ErrorInfoValue>

export declare type GracefulProps = GracefulContext & {
  setGraceful: Dispatch<SetStateAction<GracefulProps>>
  errorInfo: ErrorInfo
  theme?: GracefulTheme
  errorComponentMap?: Map<number, JSX.Element>
  DefaultErrorComponent?: JSX.Element
  WaitingRoomErrorComponent?: JSX.Element
  axios?: AxiosInstance
}

export const initialContextProps: GracefulContext = {
  ctx: {
    headers: {},
    url: '',
    isError: false,
    status: 404,
    responseBody: null,
    typeOfRequest: 'FETCH',
    method: '',
    retriesLeft: 0,
    requestBody: null,
  },
}

export const initialProps: GracefulProps = {
  ...initialContextProps,
  errorInfo: new Map(),
  setGraceful: noop,
}

export const GracefulStore = createContext<GracefulProps>(initialProps)
