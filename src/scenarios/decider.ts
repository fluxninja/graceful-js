import { maxBackOffTime } from '../provider'
import { AnyObject } from '../types'
import { getResetTime } from './utils'

export const checkHeaderAndBody = (
  data: AnyObject,
  headers: Record<Lowercase<string>, string>
) => {
  const retryAfter = data?.retryAfter || parseInt(headers['retry-after'])
  const retryLimit = data?.retryLimit || parseInt(headers['retry-limit'])
  const madeUpRetryLimit = retryAfter && !retryLimit ? 1 : retryLimit
  return {
    retryAfter,
    retryLimit: madeUpRetryLimit,
    rateLimitRemaining:
      data.rateLimitRemaining ||
      parseInt(headers?.['x-ratelimit-remaining']) ||
      0,
    resetAfter: getResetTime(data, headers),
    check: !!retryAfter,
  }
}

// used in case of 429 or 5xx errors without retry after headers
export const exponentialBackOff = (
  status: number,
  rateLimitInfoCheck: boolean,
  numberOfRetries: number
) => {
  if (rateLimitInfoCheck) {
    return {
      retryAfter: 0,
    }
  }

  if (status !== 429 && status !== 503 && status !== 504) {
    return {
      retryAfter: 0,
    }
  }

  const retryAfter = Math.min(
    (2 ^ (numberOfRetries * 1000)) + getRndInteger(500, 1000),
    maxBackOffTime * 1000
  )

  if (retryAfter === maxBackOffTime * 1000) {
    return {
      retryAfter: 0,
    }
  }

  return { retryAfter: retryAfter / 1000 }
}

function getRndInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min
}
