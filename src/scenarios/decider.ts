export const checkHeaderAndBody = (
  data: any,
  headers: Record<Lowercase<string>, string>
) => {
  let retryAfter = 0
  let retryLimit = 0
  let rateLimitRemaining = 0

  if (data?.retryAfter) {
    retryAfter = data.retryAfter
    retryLimit = data.retryLimit || 1
    rateLimitRemaining = data.rateLimitRemaining || 0
  } else if (headers?.['retry-after']) {
    retryAfter = parseInt(headers['retry-after'])
    retryLimit = parseInt(headers?.['x-ratelimit-limit']) || 1
    rateLimitRemaining = parseInt(headers?.['x-ratelimit-remaining']) || 0
  }

  return {
    retryAfter,
    retryLimit,
    check: !rateLimitRemaining ? false : !!retryAfter,
  }
}
