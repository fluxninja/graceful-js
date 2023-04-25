import React from 'react'
import { FC } from 'react'
import { useRateLimitScenarios } from './hooks'

export const RateLimit: FC = () => {
  const { isRateLimited } = useRateLimitScenarios()
  return (
    <>
      {isRateLimited ? (
        <div>
          <h1>Rate Limited</h1>
          <p>
            You have exceeded your rate limit. Please try again in a few
            minutes.
          </p>
        </div>
      ) : null}
    </>
  )
}
