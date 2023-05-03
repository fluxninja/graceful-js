import {
  createGracefulPropsWithAxios,
  createGracefulPropsWithFetch,
} from './utils'
import { refetchWithRateLimit, refetchWithRateLimitAxios } from './rate-limit'
import { AxiosError, AxiosInstance } from 'axios'
import { Dispatch, SetStateAction } from 'react'
import { GracefulContext } from '../provider'
import { GracefulErrorStatus } from '../types'

export const handleRateLimitGracefullyFetch = async (
  setContext: Dispatch<SetStateAction<GracefulContext>>,
  url: RequestInfo | URL,
  options: RequestInit | undefined,
  res: Response,
  headers: Record<string, string>,
  responseBody: any
) => {
  let retryAfter = 0
  let retryLimit = 0

  if (responseBody?.retryAfter && responseBody?.retryLimit) {
    retryAfter = responseBody.retryAfter
    retryLimit = responseBody.retryLimit
  } else if (headers?.['retry-after'] && headers?.['x-ratelimit-limit']) {
    retryAfter = parseInt(headers['retry-after'])
    retryLimit = parseInt(headers['x-ratelimit-limit'])
  } else {
    return res
  }

  return refetchWithRateLimit(
    setContext,
    url,
    options,
    res,
    retryAfter,
    retryLimit,
    res.status
  )
}

export const errorMapFetch: Map<
  GracefulErrorStatus,
  (...args: any[]) => Promise<Response>
> = new Map([
  [429, handleRateLimitGracefullyFetch],
  [503, handleRateLimitGracefullyFetch],
  [504, handleRateLimitGracefullyFetch],
])

export const fetchDecider = async (
  setContext: Dispatch<SetStateAction<GracefulContext>>,
  url: RequestInfo | URL,
  options: RequestInit | undefined,
  res: Response
) => {
  const gracefulProps = await createGracefulPropsWithFetch(res.clone())
  const { status, headers, responseBody } = gracefulProps

  setContext({
    ctx: {
      ...gracefulProps,
      method: options?.method || '',
    },
  })

  const fetchErrors = errorMapFetch.get(status) ?? (() => res)

  return await fetchErrors(setContext, url, options, res, headers, responseBody)
}

export const handleRateLimitGracefullyAxios = async (
  setContext: Dispatch<SetStateAction<GracefulContext>>,
  error: AxiosError<any, unknown>,
  axios: AxiosInstance
) => {
  const { response } = error || {}
  const { headers, data } = response || {}

  let retryAfter = 0
  let retryLimit = 0

  if (data?.retryAfter && data?.retryLimit) {
    retryAfter = data.retryAfter
    retryLimit = data.retryLimit
  } else if (headers?.['retry-after'] && headers?.['x-ratelimit-limit']) {
    retryAfter = parseInt(headers['retry-after'])
    retryLimit = parseInt(headers['x-ratelimit-limit'])
  } else {
    return Promise.reject(error)
  }

  return refetchWithRateLimitAxios(
    setContext,
    axios,
    error,
    retryAfter,
    retryLimit
  )
}

export const defaultErrorHandler = (props: any) => Promise.reject(props)

export const errorMapAxios: Map<
  GracefulErrorStatus,
  (...args: any[]) => Promise<unknown>
> = new Map([
  [429, handleRateLimitGracefullyAxios],
  [503, handleRateLimitGracefullyAxios],
  [504, handleRateLimitGracefullyAxios],
])

export const axiosDecider = (
  axios: AxiosInstance,
  setContext: Dispatch<SetStateAction<GracefulContext>>
) => {
  return async (error: AxiosError) => {
    const { response, status } = error
    if (response) {
      setContext({
        ctx: createGracefulPropsWithAxios(response),
      })
    }

    const handle =
      errorMapAxios.get(response?.status || status || 0) ?? defaultErrorHandler
    return await handle(setContext, error, axios)
  }
}
