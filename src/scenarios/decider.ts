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
  let retryAfter = 0
  let retryLimit = 0

  if (responseBody?.retryAfter && responseBody?.retryLimit) {
    retryAfter = responseBody.retryAfter
    retryLimit = responseBody.retryLimit
  } else if (headers?.['Reset-After'] && headers?.['X-RateLimit-Limit']) {
    retryAfter = parseInt(headers['Reset-After'])
    retryLimit = parseInt(headers['X-RateLimit-Limit'])
  } else {
    return res
  }

  return refetchWithRateLimit(url, options, res, retryAfter, retryLimit)
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
  const { response } = error || {}
  const { headers, data } = response || {}

  let retryAfter = 0
  let retryLimit = 0

  if (data?.retryAfter && data?.retryLimit) {
    retryAfter = data.retryAfter
    retryLimit = data.retryLimit
  } else if (headers?.['Reset-After'] && headers?.['X-RateLimit-Limit']) {
    retryAfter = parseInt(headers['Reset-After'])
    retryLimit = parseInt(headers['X-RateLimit-Limit'])
  } else {
    return Promise.reject(error)
  }

  return refetchWithRateLimitAxios(axios, error, retryAfter, retryLimit)
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
