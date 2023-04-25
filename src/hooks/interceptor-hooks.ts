import { GracefulContextProps } from '../provider'
import { Dispatch, SetStateAction, useEffect } from 'react'

import { FetchSenariosFnc } from '../types'
import {
  fetchDecider,
  createGracefulPropsWithXMLHttpRequest,
} from '../scenarios'

const { fetch: windowFetch } = window
const originalXMLRequest = window.XMLHttpRequest.prototype.open

export const useInterceptors = (
  setContext: Dispatch<SetStateAction<GracefulContextProps>>,
  urlList: string[] = [],
  isCustomInterceptor: boolean
) => {
  const baseSenariosBinded = baseSenarios.bind(null, setContext, urlList)
  useEffect(() => {
    if (isCustomInterceptor) {
      return
    }

    fetchInterceptor(baseSenariosBinded)
    window.XMLHttpRequest.prototype.open = function (method) {
      this.addEventListener('load', function () {
        if (urlList.length && !urlList.includes(this.responseURL)) return
        const props = createGracefulPropsWithXMLHttpRequest(this)
        setContext({
          ...props,
          method,
        })
      })
      // @ts-expect-error
      return originalXMLRequest.apply(this, arguments)
    }
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
