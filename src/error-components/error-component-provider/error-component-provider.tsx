import React, { PropsWithChildren, FC, useState, useMemo } from 'react'
import {
  ErrorComponentContext,
  ErrorComponentStore,
} from './error-component-context'

export const ErrorComponentProvider: FC<PropsWithChildren> = ({ children }) => {
  const [props, setErrorComponent] = useState<
    Omit<ErrorComponentContext, 'setErrorComponent'>
  >({
    renderedErrorComponents: new Map(),
  })

  const value: ErrorComponentContext = useMemo(
    () => ({
      ...props,
      setErrorComponent,
    }),
    [props]
  )

  return (
    <ErrorComponentStore.Provider value={value}>
      {children}
    </ErrorComponentStore.Provider>
  )
}
