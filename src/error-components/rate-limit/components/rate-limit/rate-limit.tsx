import React, { FC } from 'react'
import { DefaultText } from '../../../types'
import { getResetTime } from '../../../../scenarios'
import { GracefulContextProps } from '../../../../provider'
import { AnyObject } from '../../../../types'
import { SharedError } from '../../../shared'

type RateLimitInitialText = 'sorry' | 'errorMessage' | 'message' | 'backSoon'

export const defaultRateLimitInitialText: DefaultText<RateLimitInitialText> = {
  sorry: `We’re sorry`,
  errorMessage: `Our site is currently experiencing heavy traffic.`,
  message: `To ensure everyone has access to the site, we've temporarily disabled some of the features. 
      You can still use the site normally but without these features.`,
  backSoon: `We will be fully back soon`,
}

export interface RateLimitProps extends Partial<GracefulContextProps> {
  text?: DefaultText<RateLimitInitialText>
}

export const RateLimit: FC<RateLimitProps> = ({
  text = defaultRateLimitInitialText,
  ...props
}) => {
  const { responseBody, headers = {} } = props || {}

  const { resetTime, deltaSeconds } = getResetTime(
    responseBody as AnyObject,
    headers
  )

  return (
    <SharedError text={text}>
      {deltaSeconds
        ? `Please try again after ${resetTime.toUTCString()}`
        : null}
    </SharedError>
  )
}
