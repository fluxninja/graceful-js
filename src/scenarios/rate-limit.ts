import { AxiosInstance, AxiosRequestConfig } from 'axios'
import { AxiosError } from 'axios'

export const RATE_LIMITED_STATUS = 429

export interface AxiosRequestConfigWithRetry extends AxiosRequestConfig {
  __retryCount?: number
}

const originalFetch = window.fetch

export const refetchWithRateLimit = async (
  url: RequestInfo | URL,
  options: RequestInit | undefined,
  res: Response,
  retryAfter: number,
  retryLimit: number,
  STATUS_CODE: number = RATE_LIMITED_STATUS
) => {
  if (retryLimit === 0) return res
  let count = 0
  while (count < retryLimit) {
    count++
    await new Promise((resolve) => setTimeout(resolve, ~~retryAfter * 1000))
    const refetchRes = await originalFetch(url, options)
    if (count >= retryLimit || refetchRes.status !== STATUS_CODE) {
      return refetchRes
    }
  }

  throw res
}

export const refetchWithRateLimitAxios = async (
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
  return new Promise((resolve) => {
    setTimeout(() => {
      config.__retryCount = (config.__retryCount || 0) + 1
      resolve(axios(config))
    }, ~~retryAfter * 1000)
  })
}
