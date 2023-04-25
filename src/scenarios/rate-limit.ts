import { FetchSenariosFnc, RateLimitResponseBody } from '../types'

export const RATE_LIMITED_STATUS = 429

const originalFetch = window.fetch

export const retryRequestByBodyWithFetch: FetchSenariosFnc = async (
  url,
  options,
  res
) => {
  const { retryAfter, retryLimit } = ((await res
    .clone()
    .json()) as RateLimitResponseBody) || {
    retryAfter: 0,
    retryLimit: 0,
  }
  return refetchWithRateLimit(url, options, res, retryAfter, retryLimit)
}

export const retryRequestByHeaderWithFetch: FetchSenariosFnc = async (
  url,
  options,
  res
) => {
  const retryAfterHeader = res.headers.get('X-RateLimit-Reset-After')
  const retryLimitHeader = res.headers.get('X-RateLimit-Limit')
  return refetchWithRateLimit(
    url,
    options,
    res,
    parseInt(retryAfterHeader || '0'),
    parseInt(retryLimitHeader || '0')
  )
}

export const refetchWithRateLimit = async (
  url: RequestInfo | URL,
  options: RequestInit | undefined,
  res: Response,
  retryAfter: number,
  retryLimit: number,
  STATUS_CODE: number = RATE_LIMITED_STATUS
) => {
  if (retryLimit === 0) return res
  let count = 0
  while (count < retryLimit) {
    count++
    await new Promise((resolve) => setTimeout(resolve, ~~retryAfter * 1000))
    const refetchRes = await originalFetch(url, options)
    if (count >= retryLimit || refetchRes.status !== STATUS_CODE) {
      return refetchRes
    }
  }

  throw new Error('Rate limit exceeded')
}
