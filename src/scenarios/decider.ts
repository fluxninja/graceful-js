import { maxBackOffTime } from '../provider'
import { getResetTime } from './utils'

export const checkHeaderAndBody = (
  data: any,
  headers: Record<Lowercase<string>, string>
) => {
  const retryAfter = data?.retryAfter || parseInt(headers['retry-after'])
  return {
    retryAfter,
    retryLimit: data?.retryLimit || parseInt(headers?.['x-ratelimit-limit']),
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
