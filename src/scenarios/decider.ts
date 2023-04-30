import {
  createGracefulPropsWithAxios,
  createGracefulPropsWithFetch,
} from './utils'
import { refetchWithRateLimit, refetchWithRateLimitAxios } from './rate-limit'
import { AxiosError, AxiosInstance } from 'axios'
import { Dispatch, SetStateAction } from 'react'
import { GracefulContextProps } from '../provider'
import { GracefulErrorStatus } from '../types'

export const handleRateLimitGracefullyFetch = async (
  url: RequestInfo | URL,
  options: RequestInit | undefined,
  res: Response,
  headers: Record<string, string>,
  responseBody: any
) => {
  if (responseBody?.retryAfter && responseBody?.retryLimit) {
    return refetchWithRateLimit(
      url,
      options,
      res,
      responseBody.retryAfter,
      responseBody.retryLimit
    )
  }

  if (headers && headers?.['Reset-After'] && headers?.['X-RateLimit-Limit']) {
    return refetchWithRateLimit(
      url,
      options,
      res,
      parseInt(headers?.['Reset-After'] || '0'),
      parseInt(headers?.['X-RateLimit-Limit'] || '0')
    )
  }

  return res
}

export const errorMapFetch: Map<
  GracefulErrorStatus,
  (...args: any[]) => Promise<Response>
> = new Map([[429, handleRateLimitGracefullyFetch]])

export const fetchDecider = async (
  url: RequestInfo | URL,
  options: RequestInit | undefined,
  res: Response
) => {
  const gracefulProps = await createGracefulPropsWithFetch(res.clone())
  const { status, headers, responseBody } = gracefulProps

  const fetchErrors = errorMapFetch.get(status) ?? (() => res)

  return {
    gracefulProps,
    res: await fetchErrors(url, options, res, headers, responseBody),
  }
}

export const handleRateLimitGracefullyAxios = async (
  error: AxiosError<any, unknown>,
  axios: AxiosInstance
) => {
  const { response } = error
  const { headers, data } = response || {}

  if (data?.retryAfter && data?.retryLimit) {
    const { retryAfter, retryLimit } = data
    return refetchWithRateLimitAxios(axios, error, retryAfter, retryLimit)
  }

  if (headers && headers?.['Reset-After'] && headers?.['X-RateLimit-Limit']) {
    const retryAfter = parseInt(headers?.['Reset-After'] || '0')
    const retryLimit = parseInt(headers?.['X-RateLimit-Limit'] || '0')
    return refetchWithRateLimitAxios(axios, error, retryAfter, retryLimit)
  }

  return await Promise.reject(error)
}

export const defaultErrorHandler = (props: any) => Promise.reject(props)

export const errorMapAxios: Map<
  GracefulErrorStatus,
  (...args: any[]) => Promise<unknown>
> = new Map([[429, handleRateLimitGracefullyAxios]])

export const axiosDecider = (
  axios: AxiosInstance,
  setContext: Dispatch<SetStateAction<GracefulContextProps>>
) => {
  return async (error: AxiosError) => {
    const { response, status } = error
    if (response) {
      setContext(createGracefulPropsWithAxios(response))
    }

    const handle =
      errorMapAxios.get(response?.status || status || 0) ?? defaultErrorHandler
    return await handle(error, axios)
  }
}
