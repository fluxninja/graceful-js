import {
  Config,
  ErrorInfoValue,
  GracefulContext,
  GracefulContextProps,
  GracefulProps,
  initialContextProps,
} from '../provider'
import React, {
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
import { cloneDeep, pick } from 'lodash'
import { SelectErrorComponentWithStatusCode } from '../error-components/decider'
import { createErrorInfoKey } from './utils'
import { AnyObject } from '../types'

const { fetch: windowFetch } = window

function setStateInInterceptor(newProps: GracefulContext) {
  return (prev: GracefulContext) => ({
    ...prev,
    ...newProps,
  })
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
    (ctx: GracefulContextProps) =>
      createErrorInfoKey({
        ...pick(ctx, 'requestBody', 'method', 'url'),
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

      return prevProps.errorInfo.set(key, errorInfoValue)
    },
    [ctx.ctx, errorInfoKey]
  )

  useEffect(() => {
    setGracefulProps((prev) => ({
      ...prev,
      ...ctx,
      errorInfo: createErrorInfo(prev, ctx.ctx),
    }))
  }, [ctx, createErrorInfo, setGracefulProps])
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
        requestBody: options as AnyObject,
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
    const { response, config, status } = error
    if (!response) {
      setContext(
        setStateInInterceptor({
          ctx: {
            ...initialContextProps.ctx,
            method: config?.method || '',
            isError: true,
            status: status || 404,
            requestBody: config?.data,
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
        ctx,
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
