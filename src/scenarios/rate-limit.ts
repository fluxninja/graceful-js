import { AxiosInstance, AxiosRequestConfig } from 'axios'
import { AxiosError } from 'axios'
import { Dispatch, SetStateAction } from 'react'
import { GracefulContext } from '../provider'
import { createGracefulPropsWithFetch } from './utils'

export interface AxiosRequestConfigWithRetry extends AxiosRequestConfig {
  __retryCount?: number
}

const originalFetch = window.fetch

/**
 * Retries a fetch request with rate limiting.
 * @param setContext - React state setter for graceful context.
 * @param url - Request URL.
 * @param options - Fetch request options.
 * @param res - Response object.
 * @param retryAfter - Time in seconds to wait before retrying.
 * @param retryLimit - Maximum number of retries.
 * @param STATUS_CODE - HTTP status code to retry for.
 * @returns Response object after successful retry or throws error if maximum retries exceeded.
 */

export const refetchWithRateLimit = async (
  setContext: Dispatch<SetStateAction<GracefulContext>>,
  url: RequestInfo | URL,
  options: RequestInit | undefined,
  res: Response,
  retryAfter: number,
  retryLimit: number,
  STATUS_CODE: number
) => {
  let count = 0
  while (count < retryLimit) {
    count++
    await new Promise((resolve) => setTimeout(resolve, ~~retryAfter * 1000))
    const refetchRes = await originalFetch(url, options)
    const gracefulProps = await createGracefulPropsWithFetch(refetchRes.clone())

    // Update context with new retry count and props
    setContext((prev) => ({
      ctx: {
        ...prev.ctx,
        ...gracefulProps,
        retriesLeft: retryLimit - count,
      },
    }))

    // If maximum retries reached or response status code is not 429, return response
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
