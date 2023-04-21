import { GracefulContextProps, GracefulProviderProps } from '../provider'
import { Dispatch, SetStateAction, useEffect } from 'react'
import {
  createGracefulPropsWithFetch,
  createGracefulPropsWithXMLHttpRequest,
} from './utils'

const { fetch: windowFetch } = window
const originalXMLRequest = XMLHttpRequest.prototype.send

export const useInterceptors = (
  setContext: Dispatch<SetStateAction<GracefulContextProps>>,
  isCustomInterceptor?: boolean
) => {
  useEffect(() => {
    if (isCustomInterceptor) {
      return
    }
    // window fetch interceptor
    window.fetch = async (...args) => {
      const res = await windowFetch(...args)
      setContext(await createGracefulPropsWithFetch(res.clone()))
      return res
    }

    // XMLHttpRequest interceptor
    XMLHttpRequest.prototype.send = function () {
      this.addEventListener('load', function () {
        setContext(createGracefulPropsWithXMLHttpRequest(this))
      })
      // @ts-expect-error
      originalXMLRequest.apply(this, arguments)
    }
  }, [])
}
