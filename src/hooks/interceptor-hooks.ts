import {
  Config,
  GracefulContext,
  GracefulProps,
  initialContextProps,
} from '../provider'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'

import {
  createGracefulPropsWithAxios,
  createGracefulPropsWithFetch,
} from '../scenarios'
import { AxiosError, AxiosInstance, AxiosResponse } from 'axios'
import { cloneDeep, isEqual } from 'lodash'

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

  useEffect(() => {
    setGracefulProps((prev) => ({
      ...prev,
      ...ctx,
    }))
  }, [ctx])
}

export declare type FetchCollector = {
  setGracefulContext: Dispatch<SetStateAction<GracefulContext>>
  urlList: string[]
  options: RequestInit | undefined
  res: Response
}

export const applyFetchCollector = async ({
  setGracefulContext,
  urlList,
  options,
  res,
}: FetchCollector) => {
  if (urlList.length && !urlList.includes(res.url)) {
    return res
  }
  const gracefulProps = await createGracefulPropsWithFetch(
    res?.clone ? res.clone() : cloneDeep(res)
  )

  await new Promise((resolve) => setTimeout(resolve, 1000))

  setGracefulContext(
    setStateInInterceptor({
      ctx: {
        ...gracefulProps,
        method: options?.method || '',
      },
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
