import {
  Config,
  ErrorInfoValue,
  GracefulContext,
  GracefulContextProps,
  GracefulProps,
  initialContextProps,
} from '../provider'
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react'

import {
  createGracefulPropsWithAxios,
  createGracefulPropsWithFetch,
} from '../scenarios'
import { AxiosError, AxiosInstance, AxiosResponse } from 'axios'
import { cloneDeep, isEqual } from 'lodash'
import { SelectErrorComponentWithStatusCode } from '../error-components/decider'

const { fetch: windowFetch } = window

function setStateInInterceptor(newProps: GracefulContext) {
  return (prev: GracefulContext) => {
    if (isEqual(prev.ctx, newProps.ctx)) {
      return prev
    }

    return {
      ctx: newProps.ctx,
    }
  }
}

export const useInterceptors = (
  setGracefulProps: Dispatch<SetStateAction<GracefulProps>>,
  config?: Config
) => {
  const { urlList = [], axios = null } = config || {}
  const [ctx, setContext] = useState<GracefulContext>(initialContextProps)

  const f = fetchInterceptor({
    setGracefulContext: setContext,
    urlList,
  })
  const a = axiosInterceptor(setContext, axios, urlList)

  useEffect(() => {
    return () => {
      window.fetch = f
      a && axios?.interceptors.response.eject(a)
    }
  }, [urlList, axios, a, f])

  const errorInfoKey = useCallback(
    (ctx: GracefulContextProps) => ({
      url: ctx.url,
      requestBody:
        ctx.typeOfRequest === 'AXIOS'
          ? ctx.requestBody.data
          : ctx.requestBody.body,
    }),
    []
  )

  const createErrorInfo = useCallback(
    (prevProps: GracefulProps, currentCtx: GracefulContextProps) => {
      const { isError, status } = currentCtx
      if (!isError) {
        return prevProps.errorInfo
      }
      const key = errorInfoKey(currentCtx)

      const errorInfoValue: ErrorInfoValue = {
        ...ctx.ctx,
        errorComponent: (
          <SelectErrorComponentWithStatusCode
            {...{
              errorProps: currentCtx,
              status,
              userComponentMap: prevProps?.errorComponentMap,
              DefaultErrorComponent: prevProps?.DefaultErrorComponent,
            }}
          />
        ),
      }

      return prevProps.errorInfo.set(JSON.stringify(key), errorInfoValue)
    },
    [errorInfoKey]
  )

  useEffect(() => {
    setGracefulProps((prev) => ({
      ...prev,
      ...ctx,
      errorInfo: createErrorInfo(prev, ctx.ctx),
    }))
  }, [ctx])
}

export declare type FetchCollector = {
  setGracefulContext: Dispatch<SetStateAction<GracefulContext>>
  urlList: string[]
  res: Response
  options?: RequestInit
}

export const applyFetchCollector = async ({
  setGracefulContext,
  urlList,
  res,
  options,
}: FetchCollector) => {
  if (urlList.length && !urlList.includes(res.url)) {
    return res
  }

  const clonedRes = res.clone ? res.clone() : cloneDeep(res)

  if (!clonedRes) {
    setGracefulContext({
      ctx: {
        ...initialContextProps.ctx,
        isError: true,
        requestBody: options,
      },
    })

    return res
  }

  const ctx = await createGracefulPropsWithFetch(clonedRes, options)

  setGracefulContext(
    setStateInInterceptor({
      ctx,
    })
  )

  return res
}

export const fetchInterceptor = (
  fetchCollector: Omit<FetchCollector, 'res' | 'options'>
) => {
  return (window.fetch = async function (...args) {
    const [, options] = args
    const res = await windowFetch(...args)
    return applyFetchCollector({
      ...fetchCollector,
      options,
      res,
    })
  })
}

export const axiosSuccessCollector = (
  setGracefulContext: Dispatch<SetStateAction<GracefulContext>>,
  urlList: string[]
) => {
  return async (res: AxiosResponse) => {
    const ctx = createGracefulPropsWithAxios(res)
    if (urlList.length && !urlList.includes(ctx.url)) {
      return res
    }
    setGracefulContext(setStateInInterceptor({ ctx }))
    return res
  }
}

export const axiosErrorCollector = (
  setContext: Dispatch<SetStateAction<GracefulContext>>,
  urlList: string[]
) => {
  return async (error: AxiosError) => {
    const { response } = error
    if (!response) {
      setContext(
        setStateInInterceptor({
          ctx: {
            ...initialContextProps.ctx,
            method: (error?.config && error.config.method) || '',
            isError: true,
            status: error.status || 404,
            requestBody: error.config,
          },
        })
      )
      return Promise.reject(error)
    }
    const ctx = createGracefulPropsWithAxios(response)
    if (urlList.length && !urlList.includes(ctx.url)) {
      return Promise.reject(error)
    }
    setContext(
      setStateInInterceptor({
        ctx: createGracefulPropsWithAxios(response),
      })
    )

    return Promise.reject(error)
  }
}

export const axiosInterceptor = (
  setGracefulContext: Dispatch<SetStateAction<GracefulContext>>,
  axios: AxiosInstance | null,
  urlList: string[] = []
) => {
  if (!axios) return
  return axios.interceptors.response.use(
    axiosSuccessCollector(setGracefulContext, urlList),
    axiosErrorCollector(setGracefulContext, urlList)
  )
}
