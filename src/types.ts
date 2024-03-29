/**
 * Generic rate limit headers
 */
export declare type RateLimitHeaders = {
  /**
   * The number of requests that can be made
   */
  'x-ratelimit-limit': string
  /**
   * The number of remaining requests that can be made
   */
  'x-ratelimit-remaining': string
  /**
   * The number of seconds(delta-seconds) until the rate limit resets
   */
  'x-ratelimit-reset': string
  /**
   * Returned only on HTTP 429 responses if the rate limit encountered is the global rate limit (not per-route)
   */
  'x-ratelimit-global': string
  /**
   * The scope of the rate limit upto which it is valid. For example,
   * "user" or "bot"
   */
  'x-ratelimit-scope': string
  /**
   * The number of seconds after which the rate limit resets
   */
  'retry-after': string
}

export declare type RateLimitResponseBody = {
  message: string
  retryAfter: number
  retryLimit: number
  rateLimitRemaining: number
  rateLimitReset: number
  global: boolean
}

export declare type FetchScenariosFnc = (
  options: RequestInit | undefined,
  res: Response
) => Promise<Response>

export declare type GracefulErrorStatus = 429 | 503 | 504

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type AnyObject<K extends string | number | symbol = string, V = any> = {
  [key in K]: V
}
