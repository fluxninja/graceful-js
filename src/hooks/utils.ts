import { pick } from 'lodash'
import { GracefulContextProps } from '../provider'

export const createGracefulPropsWithFetch = async (clonedRes: Response) => {
  let recordHeaders = {}
  clonedRes.headers.forEach((value, key) => {
    recordHeaders = {
      ...recordHeaders,
      [key]: value,
    }
  })
  const props: GracefulContextProps = {
    ...pick(clonedRes, 'url', 'status'),
    isError: !clonedRes.ok,
    headers: recordHeaders,
    responseBody: await clonedRes.json(),
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

  const props: GracefulContextProps = {
    headers: headersObj,
    status: res.status,
    url: res.responseURL,
    isError: res.status < 200 || res.status >= 400,
    responseBody: JSON.parse(res.responseText) || null,
  }

  console.log('response for XML', res)

  return props
}
