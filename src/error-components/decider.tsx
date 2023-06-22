import { useEffect } from 'react'
import { useGraceful } from '../hooks'
import { RateLimit } from './rate-limit'
import {
  ErrorComponentContext,
  useErrorComponentContext,
} from './error-component-provider'
import { DefaultError } from './default-error'
import { GracefulContext } from '../provider'

export const useMostRecentError = (errorComponentID: string) => {
  const {
    ctx,
    DefaultErrorComponent,
    errorComponentMap: userComponentMap,
  } = useGraceful()
  const { setErrorComponent, renderedErrorComponents } =
    useErrorComponentContext()

  useEffect(() => {
    if (!ctx.isError || !ctx.url.length) {
      return
    }
    setErrorComponent(
      setNewErrorComponent(
        ctx,
        errorComponentID,
        userComponentMap,
        DefaultErrorComponent
      )
    )
  }, [errorComponentID, ctx, setNewErrorComponent])

  return renderedErrorComponents
}

export const errorComponentMap: Map<number, JSX.Element> = new Map([
  [429, <RateLimit />],
  [503, <RateLimit />],
  [504, <RateLimit />],
])

function setNewErrorComponent(
  currentCtx: GracefulContext['ctx'],
  errorComponentID: string,
  userComponentMap?: Map<number, JSX.Element>,
  DefaultErrorComponent?: JSX.Element
) {
  return (prev: Omit<ErrorComponentContext, 'setErrorComponent'>) => {
    const { renderedErrorComponents } = prev
    if (
      renderedErrorComponents.has(errorComponentID) &&
      renderedErrorComponents.get(errorComponentID)?.errorInfo?.url ===
        currentCtx.url &&
      renderedErrorComponents.get(errorComponentID)?.errorInfo?.status ===
        currentCtx.status
    ) {
      return prev
    }

    if (
      renderedErrorComponents.has(errorComponentID) &&
      renderedErrorComponents.get(errorComponentID)?.errorInfo?.url !==
        currentCtx.url
    ) {
      return prev
    }

    renderedErrorComponents.forEach((value, key) => {
      if (
        value?.errorInfo?.url === currentCtx.url &&
        value.errorInfo.status === currentCtx.status
      ) {
        renderedErrorComponents.delete(key)
      }
    })

    renderedErrorComponents.set(errorComponentID, {
      errorInfo: currentCtx,
      component: (userComponentMap &&
        userComponentMap.get(currentCtx.status)) ||
        errorComponentMap.get(currentCtx.status) ||
        DefaultErrorComponent || <DefaultError />,
    })

    return {
      renderedErrorComponents,
    }
  }
}
