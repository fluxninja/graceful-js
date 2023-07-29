import { pick } from 'lodash'
import { GracefulContextProps } from '../provider'
import { AxiosResponse } from 'axios'
import { AnyObject } from '../types'

export declare type CreateGracefulPropsWithFetch = (
  clonedRes: Response,
  options?: RequestInit
) => Promise<GracefulContextProps>

export const createGracefulPropsWithFetch: CreateGracefulPropsWithFetch =
  async (clonedRes, options) => {
    let recordHeaders = {}
    clonedRes.headers.forEach((value, key) => {
      recordHeaders = {
        ...recordHeaders,
        [key.toLocaleLowerCase()]: value,
      }
    })

    return {
      ...pick(clonedRes, 'url', 'status'),
      isError: !clonedRes.ok,
      headers: recordHeaders,
      responseBody: (await clonedRes.json()) as AnyObject,
      typeOfRequest: 'FETCH',
      requestBody: options as AnyObject,
      method: options?.method || '',
    }
  }

export declare type CreateGracefulPropsWithAxios = (
  res: AxiosResponse
) => GracefulContextProps

export const createGracefulPropsWithAxios: CreateGracefulPropsWithAxios = (
  res
) => {
  const lowerCaseHeaders = Object.keys(res.headers).reduce(
    (value, key) => ({
      ...value,
      [key.toLocaleLowerCase()]: res.headers[key],
    }),
    {}
  )

  return {
    headers: lowerCaseHeaders,
    status: res.status,
    url: axiosCompeteURL(res),
    isError: res.status < 200 || res.status >= 400,
    responseBody: res.data,
    typeOfRequest: 'AXIOS',
    method: res.config.method || '',
    requestBody: res.config?.data,
  }
}

export const isValidUrl = (urlString: string) => {
  try {
    return Boolean(new URL(urlString))
  } catch (e) {
    return false
  }
}

export const axiosCompeteURL = (res: AxiosResponse) => {
  const baseUrl = res?.config.baseURL?.trim()
  const url = res?.config.url?.trim() || ''
  if (!baseUrl?.length || isValidUrl(url)) {
    return url
  }

  const base = baseUrl[baseUrl.length - 1].includes('/')
    ? baseUrl.substring(0, baseUrl.length - 1)
    : baseUrl //remove trailing slash
  const path = !url[0].includes('/') ? `/${url}` : url // add slash in starting

  return [base, path].join('')
}

export const getResetTime = (
  responseBody: AnyObject,
  headers: Record<string, string>
) => {
  const deltaSeconds =
    responseBody?.rateLimitReset ?? headers?.['x-ratelimit-reset'] ?? 0

  const resetTime = new Date()

  resetTime.setSeconds(resetTime.getSeconds() + deltaSeconds)

  return { resetTime, deltaSeconds }
}
