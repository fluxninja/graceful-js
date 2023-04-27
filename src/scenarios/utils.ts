import { pick } from 'lodash'
import { GracefulContextProps } from '../provider'
import { AxiosResponse } from 'axios'

export const createGracefulPropsWithFetch = async (clonedRes: Response) => {
  let recordHeaders = {}
  clonedRes.headers.forEach((value, key) => {
    recordHeaders = {
      ...recordHeaders,
      [key]: value,
    }
  })
  const props: Omit<GracefulContextProps, 'method'> = {
    ...pick(clonedRes, 'url', 'status'),
    isError: !clonedRes.ok,
    headers: recordHeaders,
    responseBody: await clonedRes.json(),
    typeOfRequest: 'FETCH',
  }

  return props
}

export const createGracefulPropsWithXMLHttpRequest = (res: XMLHttpRequest) => {
  const responseHeaders = res.getAllResponseHeaders()
  // Parse the response headers into an object
  let headersObj = {}
  responseHeaders.split('\r\n').forEach((header) => {
    const [name, value] = header.split(': ')
    if (name && value) {
      headersObj = {
        ...headersObj,
        [name]: value,
      }
    }
  })

  const props: Omit<GracefulContextProps, 'method'> = {
    headers: headersObj,
    status: res.status,
    url: res.responseURL,
    isError: res.status < 200 || res.status >= 400,
    responseBody: (() => {
      try {
        return JSON.parse(res.responseText)
      } catch (e) {
        return null
      }
    })(),
    typeOfRequest: 'XML',
  }

  return props
}

export const createGracefulPropsWithAxios = (res: AxiosResponse) => {
  const props: GracefulContextProps = {
    headers: res.headers as Record<string, string>,
    status: res.status,
    url: `${res.config.baseURL}${res.config.url}` || '',
    isError: res.status < 200 || res.status >= 400,
    responseBody: res.data,
    typeOfRequest: 'AXIOS',
    method: res.config.method || '',
  }

  return props
}
