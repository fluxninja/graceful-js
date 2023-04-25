import { Dispatch, SetStateAction, createContext } from 'react'

export declare type GracefulContextProps = {
  headers: Record<string, string>
  url: string
  isError: boolean
  status: number
  responseBody: any | null
  typeOfRequest: 'FETCH' | 'XML'
  method: string
}

export const initialProps: GracefulContextProps = {
  headers: {},
  url: '',
  isError: false,
  status: 0,
  responseBody: null,
  typeOfRequest: 'FETCH',
  method: '',
}

export const GracefulContext = createContext<GracefulContextProps>(initialProps)
