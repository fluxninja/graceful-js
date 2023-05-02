import { AxiosInstance, AxiosRequestConfig } from 'axios'
import { AxiosError } from 'axios'
import { Dispatch, SetStateAction } from 'react'
import { GracefulContext } from '../provider'
import { createGracefulPropsWithFetch } from './utils'

export interface AxiosRequestConfigWithRetry extends AxiosRequestConfig {
  __retryCount?: number
}

const originalFetch = window.fetch

export const refetchWithRateLimit = async (
  setContext: Dispatch<SetStateAction<GracefulContext>>,
  url: RequestInfo | URL,
  options: RequestInit | undefined,
  res: Response,
  retryAfter: number,
  retryLimit: number,
  STATUS_CODE: number
) => {
  if (retryLimit === 0) return res
  let count = 0
  while (count < retryLimit) {
    count++
    await new Promise((resolve) => setTimeout(resolve, ~~retryAfter * 1000))
    const refetchRes = await originalFetch(url, options)
    const gracefulProps = await createGracefulPropsWithFetch(refetchRes.clone())

    setContext((prev) => ({
      ctx: {
        ...prev.ctx,
        ...gracefulProps,
        retriesLeft: retryLimit - count,
      },
    }))

    if (count >= retryLimit || refetchRes.status !== STATUS_CODE) {
      if (gracefulProps.isError) {
        throw refetchRes
      }
      return refetchRes
    }
  }

  throw res
}

export const refetchWithRateLimitAxios = async (
  setContext: Dispatch<SetStateAction<GracefulContext>>,
  axios: AxiosInstance,
  error: AxiosError,
  retryAfter: number,
  retryLimit: number
) => {
  if (!error.config) {
    throw error
  }

  const config: AxiosRequestConfigWithRetry = error.config

  if ((config.__retryCount || 0) >= retryLimit) {
    throw error
  }

  setContext((prev) => ({
    ctx: {
      ...prev.ctx,
      retriesLeft: retryLimit - (config.__retryCount || 0),
    },
  }))
  return new Promise((resolve) => {
    setTimeout(() => {
      config.__retryCount = (config.__retryCount || 0) + 1
      resolve(axios(config))
    }, ~~retryAfter * 1000)
  })
}
