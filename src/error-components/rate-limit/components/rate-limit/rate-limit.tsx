import React from 'react'
import { FC } from 'react'
import { RateLimitGrid, RateLimitWrapper } from './styled'
import { ErrorIcon } from '../../../error-icon'
import { useGracefulTheme } from '../../../../hooks'
import { Paper, Typography } from '@mui/material'
import { DefaultText } from '../../../types'

type RateLimitInitialText =
  | 'sorry'
  | 'errorMessage'
  | 'message'
  | 'backSoon'
  | 'button'

export const defaultRateLimitInitialText: DefaultText<RateLimitInitialText> = {
  sorry: `We’re sorry`,
  errorMessage: `Our site is currently experiencing heavy traffic.`,
  message: `To ensure everyone has access to the site, we've temporarily disabled some of the features. 
      You can still use the site normally but without these features.`,
  backSoon: `We will be fully back soon`,
  button: `Read more`,
}

export interface RateLimitProps {
  text?: {
    initial: DefaultText<RateLimitInitialText>
  }
}

export const RateLimit: FC<RateLimitProps> = ({
  text = {
    initial: defaultRateLimitInitialText,
  },
}) => {
  return (
    <RateLimitWrapper
      component={Paper}
      sx={{
        boxShadow: `0px 4px 4px rgba(0, 0, 0, 0.25)`,
      }}
    >
      <RateLimitInitial text={text.initial} />
    </RateLimitWrapper>
  )
}

export interface RateLimitInitialProps {
  text?: DefaultText<RateLimitInitialText>
}

export const RateLimitInitial: FC<RateLimitInitialProps> = ({
  text = defaultRateLimitInitialText,
}) => {
  const theme = useGracefulTheme()

  return (
    <>
      <RateLimitGrid>
        <ErrorIcon htmlColor={theme.primary} sx={{ width: 120, height: 75 }} />
        <RateLimitWrapper>
          <Typography
            {...{
              fontSize: 24,
              fontWeight: '700',
              lineHeight: '29px',
            }}
          >
            {text.sorry}
          </Typography>
          <Typography
            {...{
              fontSize: 16,
              fontWeight: '600',
              lineHeight: '130%',
              sx: ({ palette }) => ({
                color: palette.error.main,
              }),
            }}
          >
            {text.errorMessage}
          </Typography>
        </RateLimitWrapper>
      </RateLimitGrid>

      <RateLimitWrapper>
        <Typography
          {...{
            fontSize: 16,
            fontWeight: '400',
            lineHeight: '130%',
          }}
        >
          {text.message}
        </Typography>
        <Typography
          {...{
            fontSize: 16,
            fontWeight: '400',
            lineHeight: '130%',
          }}
        >
          {text.backSoon}
        </Typography>
      </RateLimitWrapper>
    </>
  )
}
