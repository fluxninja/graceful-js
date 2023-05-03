import { pick } from 'lodash'
import { GracefulContextProps } from '../provider'
import { AxiosResponse } from 'axios'

export const createGracefulPropsWithFetch = async (
  clonedRes: Response
): Promise<Omit<GracefulContextProps, 'method'>> => {
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

export const createGracefulPropsWithAxios = (
  res: AxiosResponse
): GracefulContextProps => {
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
