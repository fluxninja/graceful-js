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
   * The number of seconds until the rate limit resets
   */
  'x-ratelimit-reset-after': string
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
  global: boolean
}

export declare type FetchScenariosFnc = (
  url: RequestInfo | URL,
  options: RequestInit | undefined,
  res: Response
) => Promise<Response>

export declare type GracefulErrorStatus = 429 | 500 | 503 | 504
