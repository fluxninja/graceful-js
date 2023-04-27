import { Config, GracefulContextProps } from '../provider'
import { Dispatch, SetStateAction, useEffect } from 'react'

import { FetchSenariosFnc } from '../types'
import {
  axiosDecider,
  createGracefulPropsWithAxios,
  fetchDecider,
} from '../scenarios'
import { AxiosInstance } from 'axios'

const { fetch: windowFetch } = window

export const useInterceptors = (
  setContext: Dispatch<SetStateAction<GracefulContextProps>>,
  config?: Config
) => {
  const { urlList = [], axios = null } = config || {}
  const baseSenariosBinded = baseSenarios.bind(null, setContext, urlList)

  useEffect(() => {
    fetchInterceptor(baseSenariosBinded)
    axiosInterceptor(setContext, axios)
  }, [])
}

export declare type BaseSenarios = (
  setContext: Dispatch<SetStateAction<GracefulContextProps>>,
  urlList: string[],
  url: RequestInfo | URL,
  options: RequestInit | undefined,
  res: Response
) => Promise<Response>

export const baseSenarios: BaseSenarios = async (
  setContext,
  urlList,
  url,
  options,
  res
) => {
  if (urlList.length && !urlList.includes(res.url)) return res
  const { res: decidedRes, gracefulProps } = await fetchDecider(
    url,
    options,
    res
  )

  setContext({
    ...gracefulProps,
    method: options?.method || '',
  })
  return decidedRes
}

export const fetchInterceptor = (senarios: FetchSenariosFnc) => {
  window.fetch = async function (...args) {
    const [url, options] = args
    const res = await windowFetch(...args)
    return senarios(url, options, res)
  }
}

export const axiosInterceptor = (
  setContext: Dispatch<SetStateAction<GracefulContextProps>>,
  axios: AxiosInstance | null
) => {
  if (!axios) return
  axios.interceptors.response.use(async (res) => {
    setContext(createGracefulPropsWithAxios(res))
    return res
  }, axiosDecider(axios, setContext))
}
