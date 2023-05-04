import { noop } from 'lodash'
import { Dispatch, SetStateAction, createContext } from 'react'

export declare type GracefulContextProps = {
  headers: Record<string, string>
  url: string
  isError: boolean
  status: number
  responseBody: any | null
  typeOfRequest: 'FETCH' | 'AXIOS' | 'XML'
  method: string
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

export declare type GracefulProps = GracefulContext & {
  setGraceful: Dispatch<SetStateAction<GracefulProps>>
  theme?: GracefulTheme
  errorComponentMap?: Map<number, JSX.Element>
  DefaultErrorComponent?: JSX.Element
}

export const initialContextProps: GracefulContext = {
  ctx: {
    headers: {},
    url: '',
    isError: false,
    status: 0,
    responseBody: null,
    typeOfRequest: 'FETCH',
    method: '',
    retriesLeft: 0,
  },
}

export const initialProps: GracefulProps = {
  ...initialContextProps,
  setGraceful: noop,
}

export const GracefulStore = createContext<GracefulProps>(initialProps)
