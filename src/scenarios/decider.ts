import { maxBackOffTime } from '../provider'
import { getResetTime } from './utils'

export const checkHeaderAndBody = (
  data: any,
  headers: Record<Lowercase<string>, string>
) => {
  let retryAfter = 0

  if (data?.retryAfter) {
    retryAfter = data.retryAfter
  } else if (headers?.['retry-after']) {
    retryAfter = parseInt(headers['retry-after'])
  }

  return {
    retryAfter,
    retryLimit:
      data.retryLimit || parseInt(headers?.['x-ratelimit-limit']) || 1,
    rateLimitRemaining:
      data.rateLimitRemaining ||
      parseInt(headers?.['x-ratelimit-remaining']) ||
      0,
    resetAfter: getResetTime(data, headers),
    check: !!retryAfter,
  }
}

// used in case of 429 or 5xx errors without retry after headers
// max back-off time is 32 seconds

// TODO: return retry limit
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
    (2 ^ numberOfRetries) + getRndInteger(500, 1000),
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
