import {
  createGracefulPropsWithAxios,
  createGracefulPropsWithFetch,
} from './utils'
import { refetchWithRateLimit, refetchWithRateLimitAxios } from './rate-limit'
import { AxiosError, AxiosInstance } from 'axios'
import { Dispatch, SetStateAction } from 'react'
import { GracefulContext } from '../provider'

export const handleGracefullyFetch = async (
  setContext: Dispatch<SetStateAction<GracefulContext>>,
  url: RequestInfo | URL,
  options: RequestInit | undefined,
  res: Response,
  headers: Record<string, string>,
  responseBody: any
) => {
  const { retryAfter, retryLimit, check } = checkHeaderAndBody(
    responseBody,
    headers
  )

  if (!check) {
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

export const fetchDecider = async (
  setContext: Dispatch<SetStateAction<GracefulContext>>,
  url: RequestInfo | URL,
  options: RequestInit | undefined,
  res: Response
) => {
  const gracefulProps = await createGracefulPropsWithFetch(res.clone())
  const { headers, responseBody } = gracefulProps

  setContext({
    ctx: {
      ...gracefulProps,
      method: options?.method || '',
    },
  })

  return gracefulProps.isError
    ? await handleGracefullyFetch(
        setContext,
        url,
        options,
        res,
        headers,
        responseBody
      )
    : res
}

export const handleGracefullyAxios = async (
  setContext: Dispatch<SetStateAction<GracefulContext>>,
  error: AxiosError<any, unknown>,
  axios: AxiosInstance
) => {
  const { response } = error || {}

  if (!response) {
    return Promise.reject(error)
  }

  const { headers, responseBody: data } = createGracefulPropsWithAxios(response)

  const { retryAfter, retryLimit, check } = checkHeaderAndBody(data, headers)

  if (!check) {
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

export const axiosDecider = (
  axios: AxiosInstance,
  setContext: Dispatch<SetStateAction<GracefulContext>>
) => {
  return async (error: AxiosError) => {
    const { response } = error
    if (!response) {
      return Promise.reject(error)
    }

    setContext({
      ctx: createGracefulPropsWithAxios(response),
    })

    return await handleGracefullyAxios(setContext, error, axios)
  }
}

export const checkHeaderAndBody = (
  data: any,
  headers: Record<Lowercase<string>, string>
) => {
  let retryAfter = 0
  let retryLimit = 0
  let rateLimitRemaining = 0

  if (data?.retryAfter) {
    retryAfter = data.retryAfter
    retryLimit = data.retryLimit || 1
    rateLimitRemaining = data.rateLimitRemaining || 0
  } else if (headers?.['retry-after']) {
    retryAfter = parseInt(headers['retry-after'])
    retryLimit = parseInt(headers?.['x-ratelimit-limit']) || 1
    rateLimitRemaining = parseInt(headers?.['x-ratelimit-remaining']) || 0
  }

  return {
    retryAfter,
    retryLimit,
    check: !rateLimitRemaining ? false : !!retryAfter,
  }
}
