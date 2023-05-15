import { Config, GracefulContext } from '../provider'
import { Dispatch, SetStateAction, useEffect } from 'react'

import { FetchScenariosFnc } from '../types'
import {
  createGracefulPropsWithAxios,
  createGracefulPropsWithFetch,
} from '../scenarios'
import { AxiosError, AxiosInstance, AxiosResponse } from 'axios'
import { cloneDeep } from 'lodash'

const { fetch: windowFetch } = window

export const useInterceptors = (
  setGracefulContext: Dispatch<SetStateAction<GracefulContext>>,
  config?: Config
) => {
  const { urlList = [], axios = null } = config || {}
  const baseSenariosBinded = fetchCollector.bind(
    null,
    setGracefulContext,
    urlList
  )

  useEffect(() => {
    fetchInterceptor(baseSenariosBinded)
    axiosInterceptor(setGracefulContext, axios, urlList)
  }, [])
}

export declare type FetchCollector = (
  setGracefulContext: Dispatch<SetStateAction<GracefulContext>>,
  urlList: string[],
  options: RequestInit | undefined,
  res: Response
) => Promise<Response>

export const fetchCollector: FetchCollector = async (
  setGracefulContext,
  urlList,
  options,
  res
) => {
  if (urlList.length && !urlList.includes(res.url)) return res
  const gracefulProps = await createGracefulPropsWithFetch(
    res?.clone ? res.clone() : cloneDeep(res)
  )

  setGracefulContext({
    ctx: {
      ...gracefulProps,
      method: options?.method || '',
    },
  })

  return res
}

export const fetchInterceptor = (senarios: FetchScenariosFnc) => {
  window.fetch = async function (...args) {
    const [, options] = args
    const res = await windowFetch(...args)
    return senarios(options, res)
  }
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
    setGracefulContext({
      ctx,
    })
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
      return Promise.reject(error)
    }
    const ctx = createGracefulPropsWithAxios(response)
    if (urlList.length && !urlList.includes(ctx.url)) {
      return Promise.reject(error)
    }
    setContext({
      ctx: createGracefulPropsWithAxios(response),
    })

    return Promise.reject(error)
  }
}

export const axiosInterceptor = (
  setGracefulContext: Dispatch<SetStateAction<GracefulContext>>,
  axios: AxiosInstance | null,
  urlList: string[] = []
) => {
  if (!axios) return
  axios.interceptors.response.use(
    axiosSuccessCollector(setGracefulContext, urlList),
    axiosErrorCollector(setGracefulContext, urlList)
  )
}
