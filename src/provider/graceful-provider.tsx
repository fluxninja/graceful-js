import { useInterceptors } from '../hooks'
import React, {
  Dispatch,
  FC,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useState,
} from 'react'

export declare type GracefulContextProps = {
  headers: Record<string, string>
  url: string
  isError: boolean
  status: number
  responseBody: any | null
}

export declare type UseInterceptorsHook = (
  setContext: Dispatch<SetStateAction<GracefulContextProps>>
) => void

export const GracefulContext = createContext<GracefulContextProps>(
  {} as GracefulContextProps
)

export interface GracefulProviderProps {
  applyCustomInterceptors?: boolean
  useInterceptorHook?: UseInterceptorsHook
}

export const GracefulProvider: FC<PropsWithChildren<GracefulProviderProps>> = ({
  children,
  applyCustomInterceptors = false,
  useInterceptorHook = () => {},
}) => {
  const [context, setContext] = useState<GracefulContextProps>(
    {} as GracefulContextProps
  )

  useInterceptors(setContext, applyCustomInterceptors)
  useInterceptorHook(setContext)

  console.log('stored most recent context', context)

  return (
    <GracefulContext.Provider value={context}>
      {children}
    </GracefulContext.Provider>
  )
}
