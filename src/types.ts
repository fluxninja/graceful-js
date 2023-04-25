/**
 * Generic rate limit headers
 */
export declare type RateLimitHeaders = {
  /**
   * The number of requests that can be made
   */
  'X-RateLimit-Limit': string
  /**
   * The number of remaining requests that can be made
   */
  'X-RateLimit-Remaining': string
  /**
   * The number of seconds until the rate limit resets
   */
  'X-RateLimit-Reset-After': string
  /**
   * Returned only on HTTP 429 responses if the rate limit encountered is the global rate limit (not per-route)
   */
  'X-RateLimit-Global': string
  /**
   * The scope of the rate limit upto which it is valid. For example,
   * "user" or "bot"
   */
  'X-RateLimit-Scope': string
}

export declare type RateLimitResponseBody = {
  message: string
  retryAfter: number
  retryLimit: number
  global: boolean
}

export declare type FetchSenariosFnc = (
  url: RequestInfo | URL,
  options: RequestInit | undefined,
  res: Response
) => Promise<Response>
