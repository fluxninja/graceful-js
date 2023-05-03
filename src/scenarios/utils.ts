import { pick } from 'lodash'
import { GracefulContextProps } from '../provider'
import { AxiosResponse } from 'axios'

export const createGracefulPropsWithFetch = async (clonedRes: Response) => {
  let recordHeaders = {}
  clonedRes.headers.forEach((value, key) => {
    recordHeaders = {
      ...recordHeaders,
      [key.toLocaleLowerCase()]: value,
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

export const createGracefulPropsWithAxios = (res: AxiosResponse) => {
  const lowerCaseHeaders = Object.keys(res.headers).reduce(
    (value, key) => ({
      ...value,
      [key.toLocaleLowerCase()]: res.headers[key],
    }),
    {}
  )

  const props: GracefulContextProps = {
    headers: lowerCaseHeaders,
    status: res.status,
    url: `${res.config.baseURL}${res.config.url}` || '',
    isError: res.status < 200 || res.status >= 400,
    responseBody: res.data,
    typeOfRequest: 'AXIOS',
    method: res.config.method || '',
  }

  return props
}
