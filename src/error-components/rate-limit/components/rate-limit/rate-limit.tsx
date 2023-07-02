import React from 'react'
import { FC } from 'react'
import { RateLimitGrid, RateLimitWrapper } from './styled'
import { ErrorIcon } from '../../../error-icon'
import { useGracefulTheme } from '../../../../hooks'
import { Paper, Typography, TypographyProps } from '@mui/material'
import { DefaultText } from '../../../types'
import { getResetTime } from '../../../../scenarios'
import { GracefulContextProps } from '../../../../provider'

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

export interface RateLimitProps extends Partial<GracefulContextProps> {
  text?: {
    initial: DefaultText<RateLimitInitialText>
  }
}

export const RateLimit: FC<RateLimitProps> = ({
  text = {
    initial: defaultRateLimitInitialText,
  },
  ...props
}) => {
  return (
    <RateLimitWrapper
      component={Paper}
      sx={{
        boxShadow: `0px 4px 4px rgba(0, 0, 0, 0.25)`,
      }}
    >
      <RateLimitInitial
        {...{
          text: text.initial,
          ...props,
        }}
      />
    </RateLimitWrapper>
  )
}

export interface RateLimitInitialProps extends Partial<GracefulContextProps> {
  text?: DefaultText<RateLimitInitialText>
}

export const RateLimitInitial: FC<RateLimitInitialProps> = ({
  text = defaultRateLimitInitialText,
  ...props
}) => {
  const theme = useGracefulTheme()

  const commonCss: TypographyProps = {
    sx: {
      color: theme.text,
    },
  }

  const { responseBody, headers = {} } = props || {}

  const { resetTime, deltaSeconds } = getResetTime(responseBody, headers)

  return (
    <>
      <RateLimitGrid>
        <ErrorIcon htmlColor={theme.primary} sx={{ width: 200, height: 125 }} />
        <RateLimitWrapper>
          <Typography
            {...{
              ...commonCss,
              fontSize: 24,
              fontWeight: '700',
              lineHeight: '29px',
            }}
          >
            {text.sorry}
          </Typography>
          <Typography
            {...{
              ...commonCss,
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
            ...commonCss,
            fontSize: 16,
            fontWeight: '400',
            lineHeight: '130%',
          }}
        >
          {text.message}
        </Typography>
        <Typography
          {...{
            ...commonCss,
            fontSize: 16,
            fontWeight: '400',
            lineHeight: '130%',
            color: theme.secondary,
          }}
        >
          {deltaSeconds
            ? `Please try again after ${resetTime.toUTCString()}`
            : null}
        </Typography>
        <Typography
          {...{
            ...commonCss,
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
