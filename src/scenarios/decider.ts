import { createGracefulPropsWithFetch } from './utils'
import {
  retryRequestByBodyWithFetch,
  retryRequestByHeaderWithFetch,
} from './rate-limit'

export const fetchDecider = async (
  url: RequestInfo | URL,
  options: RequestInit | undefined,
  res: Response
) => {
  const gracefulProps = await createGracefulPropsWithFetch(res.clone())
  const { status, headers, responseBody } = gracefulProps

  switch (status) {
    case 429:
      return {
        gracefulProps,
        res: await handleRateLimitGracefully(
          url,
          options,
          res,
          headers,
          responseBody
        ),
      }
    default:
      return {
        gracefulProps,
        res,
      }
  }
}

export const handleRateLimitGracefully = async (
  url: RequestInfo | URL,
  options: RequestInit | undefined,
  res: Response,
  headers: Record<string, string>,
  responseBody: any
) => {
  if (responseBody?.retryAfter && responseBody?.retryLimit) {
    return retryRequestByBodyWithFetch(url, options, res)
  }

  if (
    headers &&
    headers['X-RateLimit-Reset-After'] &&
    headers['X-RateLimit-Limit']
  ) {
    return retryRequestByHeaderWithFetch(url, options, res)
  }

  return res
}
