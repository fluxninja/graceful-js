import { noop } from 'lodash'
import { Dispatch, SetStateAction, createContext, useContext } from 'react'
import { GracefulContext } from '../../provider'

export declare type ErrorComponentContext = {
  renderedErrorComponents: Map<
    string,
    {
      component: JSX.Element
      errorInfo: GracefulContext['ctx'] | null
    }
  >
  setErrorComponent: Dispatch<
    SetStateAction<Omit<ErrorComponentContext, 'setErrorComponent'>>
  >
}

export const initialErrorComponentContext: ErrorComponentContext = {
  renderedErrorComponents: new Map(),
  setErrorComponent: noop,
}

export const ErrorComponentStore = createContext<ErrorComponentContext>(
  initialErrorComponentContext
)

export const useErrorComponentContext = () => useContext(ErrorComponentStore)
