import { isFunction } from 'lodash'
import { maxBackOffTime, userExponentialBackOffFn } from '../provider'
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

export declare type ExponentialBackOffFn = (
  status: number,
  numberOfRetries: number
) => {
  /**
   * Retry after time in seconds.
   */
  retryAfter: number
}

/**
 *
 * @param status
 * @param numberOfRetries
 * @returns retryAfter - number time in seconds
 * This function is used if no retry after is specified by server. Graceful-js exponential back-off function is
 * inspired by this google example. For more information, see https://cloud.google.com/iot/docs/how-tos/exponential-backoff
 */
export const exponentialBackOffFn: ExponentialBackOffFn = (
  status,
  numberOfRetries
) => {
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

// used in case of 429 or 5xx errors without retry after headers
export const exponentialBackOff = (
  status: number,
  rateLimitInfoCheck: boolean,
  numberOfRetries: number,
  backOffFunc?: ExponentialBackOffFn
) => {
  if (rateLimitInfoCheck) {
    return {
      retryAfter: 0,
    }
  }

  if (isFunction(backOffFunc) && !userExponentialBackOffFn) {
    return backOffFunc(status, numberOfRetries)
  }

  return userExponentialBackOffFn
    ? userExponentialBackOffFn(status, numberOfRetries)
    : exponentialBackOffFn(status, numberOfRetries)
}

function getRndInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min
}
