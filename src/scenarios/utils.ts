import { pick } from 'lodash'
import { GracefulContextProps } from '../provider'
import { AxiosResponse } from 'axios'

export declare type CreateGracefulPropsWithFetch = (
  clonedRes: Response
) => Promise<Omit<GracefulContextProps, 'method'>>

export const createGracefulPropsWithFetch: CreateGracefulPropsWithFetch =
  async (clonedRes) => {
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
      responseBody: await clonedRes.json(),
      typeOfRequest: 'FETCH',
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

  const createUrl = () => {
    const baseUrl = res?.config.baseURL?.trim()
    const url = res?.config.url?.trim() || ''
    if (!baseUrl?.length) {
      return ''
    }

    const base = baseUrl[baseUrl.length - 1].includes('/')
      ? baseUrl.substring(0, baseUrl.length - 1)
      : baseUrl //remove trailing slash
    const path = !url[0].includes('/') ? `/${url}` : url // add slash in starting
    return [base, path].join('')
  }

  return {
    headers: lowerCaseHeaders,
    status: res.status,
    url: createUrl(),
    isError: res.status < 200 || res.status >= 400,
    responseBody: res.data,
    typeOfRequest: 'AXIOS',
    method: res.config.method || '',
  }
}

export const getResetTime = (
  responseBody: any,
  headers: Record<string, string>
) => {
  const deltaSeconds =
    responseBody?.rateLimitReset ?? headers?.['x-ratelimit-reset'] ?? 0

  const resetTime = new Date()

  resetTime.setSeconds(resetTime.getSeconds() + deltaSeconds)

  return { resetTime, deltaSeconds }
}
